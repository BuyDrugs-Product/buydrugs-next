const DEFAULT_GATEWAY_BASE_URL =
  "https://api.invictushealth.tech/catalog/gateway";

export const GATEWAY_BASE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_API_BASE_URL?.trim() ||
  DEFAULT_GATEWAY_BASE_URL;

// Configuration for handling slow provider responses
export const PROVIDER_TIMEOUT_CONFIG = {
  INITIAL_DELAY_MS: 3000, // Wait 3 seconds before first retry
  MAX_RETRIES: 2, // Try up to 3 times total (initial + 2 retries)
  BACKOFF_MULTIPLIER: 1.5, // Increase delay by 50% each retry
};

// ---------- Types ----------

export type UiMedicationInput = {
  name: string;
  dosage: string;
  quantity: string;
};

export type UserLocation = {
  latitude: number;
  longitude: number;
};

export type BatchSearchContext = {
  user_location?: UserLocation;
  max_distance_km?: number;
  search_mode?: "nearest_pharmacies";
  sort_by?: "distance" | "relevance" | "price";
};

export type BatchSearchRequest = {
  context?: BatchSearchContext;
  searches: {
    medication_name: string;
    quantity?: number;
  }[];
};

export type GatewayStore = {
  store_id: string;
  store_name: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  opening_hours?: string;
  closing_hours?: string;
  in_stock_quantity?: number;
  distance_km?: number;
};

export type GatewayProduct = {
  provider: string;
  product_name: string;
  brand_name?: string;
  generic_name?: string;
  strength?: string;
  strength_mg?: number;
  dosage_form?: string;
  pack_price: number;
  pack_size: number;
  unit_price: number;
  min_purchase_quantity?: number;
  supports_unit_purchase?: boolean;
  availability?: "in_stock" | "out_of_stock" | "limited" | string;
  product_url?: string;
  image_url?: string;
  stores?: GatewayStore[];
  relevance_score?: number;
};

export type BatchSearchMedicationResult = {
  query: string;
  results: GatewayProduct[];
  errors?: unknown[];
};

export type BatchSearchResponse = {
  results: Record<string, BatchSearchMedicationResult>;
};

// Aggregated store view used by the Pharmacies tab.
export type AggregatedStoreMedication = {
  medicationKey: string;
  productName: string;
  packPrice: number;
  packSize: number;
  unitPrice: number;
  availability?: GatewayProduct["availability"];
};

export type AggregatedStore = {
  storeId: string;
  storeName: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  phone?: string;
  openingHours?: string;
  closingHours?: string;
  medications: AggregatedStoreMedication[];
  availableMedicationCount: number;
  totalMedications: number;
  hasAllMedications: boolean;
  totalCostForAvailable: number;
};

export type PerMedicationOption = {
  medicationKey: string;
  productName: string;
  provider: string;
  packSize: number;
  packPrice: number;
  unitPrice: number;
  availability?: GatewayProduct["availability"];
  productUrl?: string;
  imageUrl?: string;
};

export type PerMedicationViewModel = {
  medicationKey: string;
  query: string;
  options: PerMedicationOption[];
  hasProviderErrors: boolean;
};

export type BatchSearchViewModel = {
  aggregatedStores: AggregatedStore[];
  perMedication: PerMedicationViewModel[];
  totalMedications: number;
  hasAnyProviderErrors: boolean;
};

// ---------- Helpers ----------

export function buildBatchSearchRequestFromUi(
  medications: UiMedicationInput[],
  location?: { lat: number; lng: number } | null
): BatchSearchRequest {
  const trimmed = medications
    .map((m) => ({
      name: m.name.trim(),
      dosage: m.dosage.trim(),
      quantity: m.quantity.trim(),
    }))
    .filter((m) => m.name.length > 0);

  const searches = trimmed.map((m) => {
    const combinedName = [m.name, m.dosage].filter(Boolean).join(" ").trim();
    const parsedQty = m.quantity ? Number.parseInt(m.quantity, 10) : NaN;

    return {
      medication_name: combinedName,
      quantity: Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : undefined,
    };
  });

  const request: BatchSearchRequest = {
    searches,
  };

  if (location) {
    request.context = {
      user_location: {
        latitude: location.lat,
        longitude: location.lng,
      },
      max_distance_km: 10,
      search_mode: "nearest_pharmacies",
      sort_by: "distance",
    };
  }

  return request;
}

export async function runBatchSearch(
  request: BatchSearchRequest
): Promise<BatchSearchResponse> {
  const response = await fetch(`${GATEWAY_BASE_URL}/v1/batch-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 400) {
      let errorMessage = "Invalid request.";
      try {
        const payload = (await response.json()) as {
          details?: { message?: string }[];
          error?: string;
        };
        errorMessage =
          payload?.details?.[0]?.message ??
          payload?.error ??
          "Invalid request.";
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMessage);
    }

    if (response.status === 429) {
      throw new Error(
        "You’re searching too quickly. Please wait a moment and try again."
      );
    }

    throw new Error(`Search failed with status ${response.status}.`);
  }

  const data = (await response.json()) as BatchSearchResponse;
  return data;
}

export function buildViewModelFromResponse(
  response: BatchSearchResponse
): BatchSearchViewModel {
  const medicationKeys = Object.keys(response.results);
  const totalMedications = medicationKeys.length;

  const perMedication: PerMedicationViewModel[] = medicationKeys.map(
    (key) => {
      const entry = response.results[key];
      const options: PerMedicationOption[] = (entry.results || [])
        .slice()
        .sort(
          (a, b) =>
            (a.unit_price ?? Number.POSITIVE_INFINITY) -
            (b.unit_price ?? Number.POSITIVE_INFINITY)
        )
        .map((product) => ({
          medicationKey: key,
          productName: product.product_name,
          provider: product.provider,
          packSize: product.pack_size,
          packPrice: product.pack_price,
          unitPrice: product.unit_price,
          availability: product.availability,
          productUrl: product.product_url,
          imageUrl: product.image_url,
        }));

      return {
        medicationKey: key,
        query: entry.query,
        options,
        hasProviderErrors: Boolean(entry.errors && entry.errors.length > 0),
      };
    }
  );

  const aggregatedStores = aggregateStoresFromBatch(response);
  const hasAnyProviderErrors = perMedication.some(
    (m) => m.hasProviderErrors
  );

  return {
    aggregatedStores,
    perMedication,
    totalMedications,
    hasAnyProviderErrors,
  };
}

/**
 * Merges a new view model with an existing one, combining results from multiple providers.
 * This is used when retrying a search to get results from slower providers.
 */
export function mergeViewModels(
  existing: BatchSearchViewModel,
  incoming: BatchSearchViewModel
): BatchSearchViewModel {
  // Merge per-medication options
  const mergedPerMedication: PerMedicationViewModel[] = existing.perMedication.map(
    (existingMed) => {
      const incomingMed = incoming.perMedication.find(
        (m) => m.medicationKey === existingMed.medicationKey
      );

      if (!incomingMed) {
        return existingMed;
      }

      // Combine options from both, removing duplicates by provider + product name
      const optionMap = new Map<string, PerMedicationOption>();
      
      [...existingMed.options, ...incomingMed.options].forEach((option) => {
        const key = `${option.provider}|${option.productName}`;
        if (!optionMap.has(key)) {
          optionMap.set(key, option);
        }
      });

      const mergedOptions = Array.from(optionMap.values()).sort(
        (a, b) =>
          (a.unitPrice ?? Number.POSITIVE_INFINITY) -
          (b.unitPrice ?? Number.POSITIVE_INFINITY)
      );

      return {
        medicationKey: existingMed.medicationKey,
        query: incomingMed.query || existingMed.query,
        options: mergedOptions,
        // Keep provider errors flag if either has errors
        hasProviderErrors:
          existingMed.hasProviderErrors || incomingMed.hasProviderErrors,
      };
    }
  );

  // Merge aggregated stores
  const storeMap = new Map<string, AggregatedStore>();

  [...existing.aggregatedStores, ...incoming.aggregatedStores].forEach(
    (store) => {
      if (!storeMap.has(store.storeId)) {
        storeMap.set(store.storeId, { ...store });
      } else {
        // Merge medications for the same store
        const existingStore = storeMap.get(store.storeId)!;
        const medMap = new Map<string, AggregatedStoreMedication>();

        [...existingStore.medications, ...store.medications].forEach((med) => {
          const existing = medMap.get(med.medicationKey);
          if (!existing || med.unitPrice < existing.unitPrice) {
            medMap.set(med.medicationKey, med);
          }
        });

        existingStore.medications = Array.from(medMap.values());
        existingStore.availableMedicationCount = existingStore.medications.length;
        existingStore.hasAllMedications =
          existingStore.availableMedicationCount === existingStore.totalMedications;
        existingStore.totalCostForAvailable = existingStore.medications.reduce(
          (sum, med) => sum + med.packPrice,
          0
        );
      }
    }
  );

  const mergedStores = Array.from(storeMap.values());

  // Re-sort stores
  mergedStores.sort((a, b) => {
    if (a.hasAllMedications && !b.hasAllMedications) return -1;
    if (!a.hasAllMedications && b.hasAllMedications) return 1;

    if (a.hasAllMedications && b.hasAllMedications) {
      if (a.totalCostForAvailable !== b.totalCostForAvailable) {
        return a.totalCostForAvailable - b.totalCostForAvailable;
      }
      const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return aDist - bDist;
    }

    if (a.availableMedicationCount !== b.availableMedicationCount) {
      return b.availableMedicationCount - a.availableMedicationCount;
    }
    const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY;
    return aDist - bDist;
  });

  return {
    aggregatedStores: mergedStores,
    perMedication: mergedPerMedication,
    totalMedications: existing.totalMedications,
    hasAnyProviderErrors:
      mergedPerMedication.some((m) => m.hasProviderErrors),
  };
}

export function aggregateStoresFromBatch(
  response: BatchSearchResponse
): AggregatedStore[] {
  const medicationKeys = Object.keys(response.results);
  const totalMedications = medicationKeys.length;

  const storeMap = new Map<string, AggregatedStore>();

  for (const medicationKey of medicationKeys) {
    const medResult = response.results[medicationKey];

    for (const product of medResult.results || []) {
      if (!product.stores || product.stores.length === 0) continue;

      for (const store of product.stores) {
        if (!storeMap.has(store.store_id)) {
          storeMap.set(store.store_id, {
            storeId: store.store_id,
            storeName: store.store_name,
            latitude: store.latitude,
            longitude: store.longitude,
            distanceKm: store.distance_km,
            phone: store.phone,
            openingHours: store.opening_hours,
            closingHours: store.closing_hours,
            medications: [],
            availableMedicationCount: 0,
            totalMedications,
            hasAllMedications: false,
            totalCostForAvailable: 0,
          });
        }

        const aggStore = storeMap.get(store.store_id)!;

        // If this store already has an entry for this medication, keep the cheaper one.
        const existingIndex = aggStore.medications.findIndex(
          (m) => m.medicationKey === medicationKey
        );

        const candidate: AggregatedStoreMedication = {
          medicationKey,
          productName: product.product_name,
          packPrice: product.pack_price,
          packSize: product.pack_size,
          unitPrice: product.unit_price,
          availability: product.availability,
        };

        if (existingIndex === -1) {
          aggStore.medications.push(candidate);
        } else {
          const existing = aggStore.medications[existingIndex];
          if (candidate.unitPrice < existing.unitPrice) {
            aggStore.medications[existingIndex] = candidate;
          }
        }
      }
    }
  }

  for (const store of storeMap.values()) {
    store.availableMedicationCount = store.medications.length;
    store.hasAllMedications =
      store.availableMedicationCount === store.totalMedications;
    store.totalCostForAvailable = store.medications.reduce(
      (sum, med) => sum + med.packPrice,
      0
    );
  }

  const stores = Array.from(storeMap.values());

  // Stable ordering: complete first (by total cost, then distance), then partial.
  stores.sort((a, b) => {
    if (a.hasAllMedications && !b.hasAllMedications) return -1;
    if (!a.hasAllMedications && b.hasAllMedications) return 1;

    if (a.hasAllMedications && b.hasAllMedications) {
      if (a.totalCostForAvailable !== b.totalCostForAvailable) {
        return a.totalCostForAvailable - b.totalCostForAvailable;
      }
      const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY;
      return aDist - bDist;
    }

    // Both partial: sort by available count desc, then distance.
    if (a.availableMedicationCount !== b.availableMedicationCount) {
      return b.availableMedicationCount - a.availableMedicationCount;
    }
    const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY;
    const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY;
    return aDist - bDist;
  });

  return stores;
}
