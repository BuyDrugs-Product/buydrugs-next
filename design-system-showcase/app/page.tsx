"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { SegmentedControl } from "@/components/SegmentedControl";
import { Badge } from "@/components/Badge";
import {
  AggregatedStore,
  AggregatedStoreMedication,
  BatchSearchViewModel,
  PerMedicationOption,
  PerMedicationViewModel,
  UiMedicationInput,
  buildBatchSearchRequestFromUi,
} from "@/lib/medicationGateway";
import { useMedicationSearch } from "@/hooks/useMedicationSearch";

type MedicationRow = {
  id: string;
  name: string;
  dosage: string;
  quantity: string;
};

export default function Home() {
  const [currentMedication, setCurrentMedication] = useState<MedicationRow>({
    id: "current",
    name: "",
    dosage: "",
    quantity: "",
  });
  const [medications, setMedications] = useState<MedicationRow[]>([]);
  const nextIdRef = useRef(1);
  const medicationNameRef = useRef<HTMLInputElement | null>(null);
  const dosageRef = useRef<HTMLInputElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationPromptVisible, setLocationPromptVisible] = useState(false);
  const [pendingSearchMedications, setPendingSearchMedications] = useState<
    MedicationRow[] | null
  >(null);
  const [hasSeenLocationPrompt, setHasSeenLocationPrompt] = useState(false);
  
  // Use the custom hook
  const {
    startSearch: runSearch,
    cancelSearch,
    viewModel: searchViewModel,
    status: searchStatus,
    error: searchError,
    isRetrying: isProviderRetrying,
    providerCount
  } = useMedicationSearch();

  const [activeResultsTab, setActiveResultsTab] = useState<
    "pharmacies" | "medications"
  >("pharmacies");
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  // Map hook state to local state equivalent
  const isSearching = searchStatus === "loading" || isProviderRetrying;

  const handleCurrentChange = (
    field: keyof Omit<MedicationRow, "id">,
    value: string
  ) => {
    setCurrentMedication((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addMedication = () => {
    const trimmedName = currentMedication.name.trim();
    const trimmedDosage = currentMedication.dosage.trim();
    const trimmedQuantity = currentMedication.quantity.trim();

    if (!trimmedName && !trimmedDosage && !trimmedQuantity) {
      return;
    }

    const id = `med-${nextIdRef.current++}`;

    setMedications((prev) => [
      ...prev,
      {
        id,
        name: trimmedName,
        dosage: trimmedDosage,
        quantity: trimmedQuantity,
      },
    ]);

    setCurrentMedication((prev) => ({
      ...prev,
      name: "",
      dosage: "",
      quantity: "",
    }));

    // Return focus to the first field so users can quickly add another medication
    medicationNameRef.current?.focus();
  };

  const updateMedication = (
    id: string,
    field: keyof Omit<MedicationRow, "id">,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const removeMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const editMedication = (id: string) => {
    setMedications((prev) => {
      const target = prev.find((med) => med.id === id);
      if (!target) return prev;

      setCurrentMedication({
        id: "current",
        name: target.name,
        dosage: target.dosage,
        quantity: target.quantity,
      });

      return prev.filter((med) => med.id !== id);
    });
  };

  const startSearch = (
    payload: MedicationRow[],
    locationOverride?: { lat: number; lng: number } | null
  ) => {
    if (!payload.length) return;
    const uiMedications: UiMedicationInput[] = payload.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      quantity: m.quantity,
    }));

    const request = buildBatchSearchRequestFromUi(
      uiMedications,
      locationOverride ?? location
    );

    runSearch(request);
  };

  const handleComparePrices = () => {
    if (isSearching) return;

    const trimmedCurrent: MedicationRow | null =
      currentMedication.name.trim() ||
      currentMedication.dosage.trim() ||
      currentMedication.quantity.trim()
        ? {
            ...currentMedication,
            name: currentMedication.name.trim(),
            dosage: currentMedication.dosage.trim(),
            quantity: currentMedication.quantity.trim(),
          }
        : null;

    const payload = [...medications, ...(trimmedCurrent ? [trimmedCurrent] : [])];

    if (!payload.length) {
      return;
    }

    if (!hasSeenLocationPrompt) {
      setPendingSearchMedications(payload);
      setLocationPromptVisible(true);
      setHasSeenLocationPrompt(true);
      return;
    }

    void startSearch(payload);
  };

  const handleUseLocation = () => {
    if (!pendingSearchMedications) return;

    setLocationPromptVisible(false);

    if (!("geolocation" in navigator)) {
      void startSearch(pendingSearchMedications, null);
      setPendingSearchMedications(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        void startSearch(pendingSearchMedications, coords);
        setPendingSearchMedications(null);
      },
      () => {
        // User denied or something went wrong; continue without location.
        void startSearch(pendingSearchMedications, null);
        setPendingSearchMedications(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
      }
    );
  };

  const handleSkipLocation = () => {
    if (!pendingSearchMedications) return;
    setLocationPromptVisible(false);
    void startSearch(pendingSearchMedications, null);
    setPendingSearchMedications(null);
  };

  const hasResults =
    searchStatus === "success" &&
    searchViewModel &&
    (searchViewModel.perMedication.some(
      (m: PerMedicationViewModel) => m.options.length > 0
    ) ||
      searchViewModel.aggregatedStores.length > 0);

  useEffect(() => {
    if (searchStatus === "success" || searchStatus === "error") {
      resultsHeadingRef.current?.focus();
    }
  }, [searchStatus]);

  return (
    <main className="min-h-screen bg-(--surface-app) px-6 py-10 lg:px-12 lg:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:grid lg:min-h-[70vh] lg:grid-cols-2 lg:items-center lg:gap-16">
        <section className="max-w-xl space-y-6 lg:max-w-none lg:pr-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
            Prescription savings, simplified
          </span>
          <div>
            <h1 className="text-4xl font-semibold text-(--text-primary) md:text-5xl">
              Buy Your Drugs at the Best Prices
            </h1>
            <p className="mt-3 text-base text-(--text-secondary) md:text-lg">
              Compare real-time prices from multiple pharmacies and save on your
              prescriptions.
            </p>
          </div>
          <p className="text-sm text-(--text-secondary)">
            Instantly compare prices, of <b>LEGAL</b> drugs, and find the
            most affordable options near you.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <AppStoreBadge type="google" />
            <AppStoreBadge type="apple" />
          </div>
        </section>

        <section className="w-full lg:pl-4">
          <Card
            padding="lg"
            elevation="md"
            surface="elevated"
            className="w-full h-full max-w-xl lg:max-w-none"
          >
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--text-tertiary)">
                Search for Your Medications
              </p>
              <p className="text-sm text-(--text-secondary)">
                Type one or more prescriptions to compare prices in seconds.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-(--border-focus) bg-(--surface-elevated) px-4 py-4 shadow-(--shadow-1)">
                <div className="mb-2 inline-flex items-center rounded-full bg-(--surface-app-strong) px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-(--text-brand)">
                  Add Drug to Compare
                </div>
                <div className="space-y-3">
                  <TextField
                    ref={medicationNameRef}
                    label="Medication name"
                    placeholder="Type drug name (e.g., Amoxicillin 500mg)"
                    value={currentMedication.name}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        dosageRef.current?.focus();
                      }
                    }}
                    onChange={(e) =>
                      handleCurrentChange("name", e.target.value)
                    }
                  />
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
                    <TextField
                      ref={dosageRef}
                      label="Strength"
                      placeholder="e.g., 500mg"
                      value={currentMedication.dosage}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          quantityRef.current?.focus();
                        }
                      }}
                      onChange={(e) =>
                        handleCurrentChange("dosage", e.target.value)
                      }
                    />
                    <TextField
                      ref={quantityRef}
                      label="Quantity"
                      placeholder="Quantity needed"
                      value={currentMedication.quantity}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addMedication();
                        }
                      }}
                      onChange={(e) =>
                        handleCurrentChange("quantity", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {medications.length > 0 && (
                <AdditionalMedicationsList
                  items={medications}
                  onEdit={editMedication}
                  onRemove={removeMedication}
                />
              )}
            </div>

            {locationPromptVisible && pendingSearchMedications && (
              <LocationNotice
                onUseLocation={handleUseLocation}
                onSkip={handleSkipLocation}
                disabled={isSearching}
              />
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                fullWidth
                onClick={addMedication}
              >
                + Add another medication
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={handleComparePrices}
              >
                {isSearching ? (
                  <>
                    <Spinner />
                    <span className="ml-2">
                      {isProviderRetrying
                        ? "Still waiting for pharmacies…"
                        : "Comparing prices…"}
                    </span>
                  </>
                ) : (
                  "Compare Prices Now"
                )}
              </Button>
            </div>
          </Card>
        </section>
      </div>
      <div className="mx-auto mt-10 max-w-6xl lg:mt-14">
        <ResultsContainer
          status={searchStatus}
          viewModel={searchViewModel}
          errorMessage={searchError}
          hasResults={!!hasResults}
          isProviderRetrying={isProviderRetrying}
          providerCount={providerCount}
          activeTab={activeResultsTab}
          onTabChange={setActiveResultsTab}
          headingRef={resultsHeadingRef}
        />
      </div>
    </main>
  );
}

type AdditionalMedicationsListProps = {
  items: MedicationRow[];
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
};

const AdditionalMedicationsList: React.FC<AdditionalMedicationsListProps> = ({
  items,
  onEdit,
  onRemove,
}) => {
  return (
    <div className="mt-1 space-y-2 border-t border-(--border-subtle) pt-3">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-(--text-tertiary)">
        <span>Added drugs</span>
        <span>{items.length} added</span>
      </div>
      <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
        {items.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between gap-2 rounded-lg bg-neutral-100 px-2 py-1.5"
          >
            <div className="flex min-w-0 flex-1 flex-col text-(--text-secondary) sm:flex-row sm:items-center sm:gap-2">
              <span className="truncate text-xs font-medium">
                {med.name || "Untitled medication"}
              </span>
              <span className="hidden text-[11px] text-(--text-tertiary) sm:inline">
                {med.dosage || "No strength"}
                {med.quantity ? ` · ${med.quantity}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onEdit(med.id)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => onRemove(med.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type LocationNoticeProps = {
  onUseLocation: () => void;
  onSkip: () => void;
  disabled?: boolean;
};

const LocationNotice = ({
  onUseLocation,
  onSkip,
  disabled,
}: LocationNoticeProps) => {
  return (
    <div className="mt-4 rounded-lg bg-(--surface-muted) px-4 py-3 text-xs text-(--text-secondary)">
      <p className="font-medium text-(--text-primary)">
        Use your location for better matches
      </p>
      <p className="mt-1">
        Sharing your approximate location helps us find pharmacies and prices
        closer to you. If you prefer not to share, we&apos;ll still compare
        prices, but results may include pharmacies that are farther away.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={onUseLocation}
        >
          Use my location
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={onSkip}
        >
          Continue without location
        </Button>
      </div>
    </div>
  );
};

const Spinner = () => (
  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-(--surface-elevated) border-t-transparent" />
);

type StoreBadgeProps = {
  type: "google" | "apple";
};

const AppStoreBadge: React.FC<StoreBadgeProps> = ({ type }) => {
  const isGoogle = type === "google";
  const label = isGoogle ? "Get it on" : "Download on the";
  const storeName = isGoogle ? "Google Play" : "App Store";

  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-sm border border-(--border-subtle) bg-(--surface-elevated) px-4 py-2 text-left shadow-(--shadow-1) transition hover:-translate-y-0.5 hover:shadow-(--shadow-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--surface-app)"
      aria-label={`${storeName} badge`}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-(--surface-app-strong) text-(--text-brand)">
        {isGoogle ? <PlayIcon /> : <AppleIcon />}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-(--text-tertiary)">{label}</span>
        <span className="text-xs font-semibold text-(--text-primary)">
          {storeName}
        </span>
      </div>
    </button>
  );
};

const PlayIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

const AppleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 2c-1.1.1-2.4.7-3.1 1.5-.7.8-1.3 2.1-1.1 3.3" />
    <path d="M18.5 12.3c0-2.1 1.7-3.1 1.8-3.2-1-.1-2 .6-2.5.6-.6 0-1.5-.6-2.5-.6-1.3 0-2.5.8-3.1 2-.7 1.2-.6 3 .3 4.5.6 1 1.4 2.1 2.5 2.1 1 0 1.4-.6 2.7-.6 1.2 0 1.6.6 2.7.6 1.1 0 1.8-1 2.4-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.2-.8-2.3-3.1z" />
  </svg>
);

type ResultsContainerProps = {
  status: "idle" | "loading" | "success" | "error";
  viewModel: BatchSearchViewModel | null;
  errorMessage: string | null;
  hasResults: boolean;
  isProviderRetrying: boolean;
  providerCount: number;
  activeTab: "pharmacies" | "medications";
  onTabChange: (tab: "pharmacies" | "medications") => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
};

export const ResultsContainer: React.FC<ResultsContainerProps> = ({
  status,
  viewModel,
  errorMessage,
  hasResults,
  isProviderRetrying,
  providerCount,
  activeTab,
  onTabChange,
  headingRef,
}) => {
  const showIdlePlaceholder = status === "idle";
  const showLoading = status === "loading";
  const showError = status === "error";
  const showSuccess = status === "success" && hasResults && viewModel;
  const showEmptySuccess = status === "success" && !hasResults;

  const completeStores: AggregatedStore[] =
    viewModel?.aggregatedStores.filter(
      (s: AggregatedStore) => s.hasAllMedications
    ) ?? [];
  const partialStores: AggregatedStore[] =
    viewModel?.aggregatedStores.filter(
      (s: AggregatedStore) => !s.hasAllMedications
    ) ?? [];

  return (
    <section className="mt-8 border-t border-(--border-subtle) pt-6">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-sm font-semibold uppercase tracking-[0.22em] text-(--text-tertiary)"
      >
        Price comparison results
      </h2>

      <div
        className="mt-2 text-xs text-(--text-secondary)"
        aria-live="polite"
      >
        {status === "loading" && (
          <span>Comparing prices for your prescriptions…</span>
        )}
        {status === "success" && hasResults && viewModel && (
          <span>
            Found{" "}
            {viewModel.aggregatedStores.length > 0
              ? `${viewModel.aggregatedStores.length} pharmacies`
              : `${viewModel.perMedication.length} medications`}
            {" for your prescription. "}
            <span className="text-[10px] text-(--text-tertiary)">
              ({viewModel.perMedication.reduce((sum, m) => sum + m.options.length, 0)} total options from{" "}
              {providerCount} providers)
            </span>
          </span>
        )}
        {status === "success" && !hasResults && (
          <span>No pharmacies were found for this prescription.</span>
        )}
      </div>
      {isProviderRetrying && (
        <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-(--surface-muted) px-3 py-2 text-xs text-(--text-secondary)">
          <Spinner />
          <span>
            Some pharmacies are taking longer to respond. We&apos;re showing partial results while waiting for all providers…
          </span>
        </div>
      )}

      {showIdlePlaceholder && (
        <p className="mt-4 text-xs text-(--text-tertiary)">
          After you compare prices, we’ll show the best pharmacies and
          per‑medication options here.
        </p>
      )}

      {showLoading && (
        <div className="mt-4 space-y-4">
          <ResultsSkeleton />
        </div>
      )}

      {showError && (
        <ResultsErrorState
          message={
            errorMessage ||
            "We couldn’t complete your search. Please try again."
          }
        />
      )}

      {showEmptySuccess && <ResultsEmptyState />}

      {showSuccess && viewModel && (
        <ResultsSuccess
          viewModel={viewModel}
          completeStores={completeStores}
          partialStores={partialStores}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}
    </section>
  );
};

type ResultsSuccessProps = {
  viewModel: BatchSearchViewModel;
  completeStores: AggregatedStore[];
  partialStores: AggregatedStore[];
  activeTab: "pharmacies" | "medications";
  onTabChange: (tab: "pharmacies" | "medications") => void;
};

const ResultsSuccess: React.FC<ResultsSuccessProps> = ({
  viewModel,
  completeStores,
  partialStores,
  activeTab,
  onTabChange,
}) => {
  const totalMedications = viewModel.totalMedications;
  const hasComplete = completeStores.length > 0;

  const bestOverall = hasComplete
    ? completeStores[0]
    : partialStores[0] ?? null;

  const nearestComplete = hasComplete
    ? [...completeStores].sort((a, b) => {
        const aDist = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const bDist = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return aDist - bDist;
      })[0]
    : null;

  return (
    <div className="mt-6 space-y-5">
      <div className="space-y-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-base font-semibold text-(--text-primary)">
            Best options for {totalMedications}{" "}
            {totalMedications === 1 ? "medication" : "medications"}
          </h3>
          <p className="text-xs text-(--text-tertiary)">As of just now</p>
        </div>

        <p className="text-xs text-(--text-secondary)">
          {hasComplete ? (
            <>
              {completeStores.length}{" "}
              {completeStores.length === 1 ? "pharmacy" : "pharmacies"} can fill
              everything · {partialStores.length} more nearby with partial
              stock
            </>
          ) : (
            <>
              No single pharmacy has all medications. These are your best
              options.
            </>
          )}
        </p>

        {viewModel.hasAnyProviderErrors && (
          <p className="mt-1 rounded-md bg-(--surface-muted) px-2 py-1 text-[11px] text-(--text-secondary)">
            Some pharmacies didn’t respond. These results may be incomplete.
          </p>
        )}
      </div>

      {bestOverall && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border border-(--border-focus)">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
                  Best overall
                </span>
                <Badge count="Recommended" variant="brand" />
              </div>
              <p className="text-sm font-semibold text-(--text-primary)">
                {bestOverall.storeName}
              </p>
              <p className="text-xs text-(--text-secondary)">
                {bestOverall.hasAllMedications
                  ? "All medications in stock"
                  : `${bestOverall.availableMedicationCount}/${bestOverall.totalMedications} medications available`}
              </p>
              <p className="text-sm font-semibold text-(--text-primary)">
                Total{" "}
                <span className="text-(--text-brand)">
                  KES {bestOverall.totalCostForAvailable.toFixed(0)}
                </span>
              </p>
            </div>
          </Card>

          {nearestComplete && nearestComplete.storeId !== bestOverall.storeId && (
            <Card>
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--text-tertiary)">
                  Nearest with everything
                </span>
                <p className="text-sm font-semibold text-(--text-primary)">
                  {nearestComplete.storeName}
                </p>
                {nearestComplete.distanceKm != null && (
                  <p className="text-xs text-(--text-secondary)">
                    {nearestComplete.distanceKm.toFixed(1)} km away
                  </p>
                )}
                <p className="text-sm font-semibold text-(--text-primary)">
                  Total{" "}
                  <span className="text-(--text-brand)">
                    KES {nearestComplete.totalCostForAvailable.toFixed(0)}
                  </span>
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <SegmentedControl
          ariaLabel="Results view"
          options={[
            { value: "pharmacies", label: "Pharmacies" },
            { value: "medications", label: "Medications" },
          ]}
          value={activeTab}
          onChange={(val) =>
            onTabChange(val as "pharmacies" | "medications")
          }
          size="sm"
        />

        {activeTab === "pharmacies" ? (
          <PharmacyResultsList
            completeStores={completeStores}
            partialStores={partialStores}
            totalMedications={totalMedications}
          />
        ) : (
          <MedicationResultsList medications={viewModel.perMedication} />
        )}
      </div>
    </div>
  );
};

type PharmacyResultsListProps = {
  completeStores: AggregatedStore[];
  partialStores: AggregatedStore[];
  totalMedications: number;
};

const PharmacyResultsList: React.FC<PharmacyResultsListProps> = ({
  completeStores,
  partialStores,
  totalMedications,
}) => {
  const hasComplete = completeStores.length > 0;

  return (
    <div className="space-y-5">
      {hasComplete && (
        <section className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-(--text-tertiary)">
            Pharmacies with all medications
          </h4>
          <div className="space-y-3">
            {completeStores.map((store) => (
              <PharmacyCard
                key={store.storeId}
                store={store}
                totalMedications={totalMedications}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-(--text-tertiary)">
          {hasComplete ? "Other nearby pharmacies" : "Nearby pharmacies"}
        </h4>
        {partialStores.length === 0 && !hasComplete ? (
          <p className="text-xs text-(--text-secondary)">
            No pharmacies with your medications were found.
          </p>
        ) : (
          <div className="space-y-3">
            {partialStores.map((store) => (
              <PharmacyCard
                key={store.storeId}
                store={store}
                totalMedications={totalMedications}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

type PharmacyCardProps = {
  store: AggregatedStore;
  totalMedications: number;
};

const PharmacyCard: React.FC<PharmacyCardProps> = ({
  store,
  totalMedications,
}) => {
  const missingCount = totalMedications - store.availableMedicationCount;
  const missingMedications =
    missingCount > 0
      ? store.medications.length === 0
        ? []
        : store.medications
            .map((m: AggregatedStoreMedication) => m.medicationKey)
            .slice(0, 3)
      : [];

  const mapsHref =
    store.latitude != null && store.longitude != null
      ? `https://maps.google.com/?q=${store.latitude},${store.longitude}`
      : undefined;

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-(--text-primary)">
            {store.storeName}
          </p>
          {store.distanceKm != null && (
            <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-[11px] text-(--text-secondary)">
              {store.distanceKm.toFixed(1)} km away
            </span>
          )}
        </div>
        <p className="text-xs text-(--text-secondary)">
          {store.hasAllMedications ? (
            <span className="font-medium text-(--text-success)">
              ✅ All medications in stock
            </span>
          ) : (
            <>
              <span className="font-medium">
                {store.availableMedicationCount}/{totalMedications}
              </span>{" "}
              medications available
            </>
          )}
        </p>
        <p className="text-sm font-semibold text-(--text-primary)">
          Total:{" "}
          <span className="text-(--text-brand)">
            KES {store.totalCostForAvailable.toFixed(0)}
          </span>
        </p>
        {missingCount > 0 && (
          <p className="text-[11px] text-(--text-tertiary)">
            Missing {missingCount}{" "}
            {missingCount === 1 ? "medication" : "medications"}
            {missingMedications.length > 0 && (
              <>
                : {missingMedications.join(",")}
                {missingCount > missingMedications.length ? "…" : ""}
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:items-end">
        <div className="flex flex-wrap gap-2">
          {store.openingHours && store.closingHours && (
            <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-[11px] text-(--text-secondary)">
              🕒 {store.openingHours} – {store.closingHours}
            </span>
          )}
          {store.phone && (
            <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-[11px] text-(--text-secondary)">
              📞 {store.phone}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {mapsHref && (
            <a href={mapsHref} target="_blank" rel="noopener noreferrer">
              <Button type="button" size="sm" variant="secondary">
                Get directions
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

type MedicationResultsListProps = {
  medications: PerMedicationViewModel[];
};

const MedicationResultsList: React.FC<MedicationResultsListProps> = ({
  medications,
}) => {
  return (
    <div className="space-y-4">
      {medications.map((med) => (
        <Card key={med.medicationKey} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-(--text-primary)">
                {med.medicationKey}
              </p>
              <p className="text-xs text-(--text-secondary)">
                {med.options.length}{" "}
                {med.options.length === 1 ? "option" : "options"} found
              </p>
            </div>
            {med.hasProviderErrors && (
              <span className="text-[11px] text-(--text-tertiary)">
                Some pharmacies didn’t respond for this medication.
              </span>
            )}
          </div>

          {med.options.length === 0 ? (
            <p className="text-xs text-(--text-secondary)">
              No pharmacies found for this medication. Try checking the
              spelling, using a generic name, or removing the dosage.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-(--border-subtle) text-[11px] uppercase tracking-[0.14em] text-(--text-tertiary)">
                  <tr>
                    <th className="py-1 pr-3">Product</th>
                    <th className="py-1 pr-3">Provider</th>
                    <th className="py-1 pr-3">Pack</th>
                    <th className="py-1 pr-3">Pack price</th>
                    <th className="py-1 pr-3">Unit price</th>
                    <th className="py-1 pr-3">Availability</th>
                    <th className="py-1 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {med.options.map((opt: PerMedicationOption, index: number) => (
                    <tr
                      key={`${opt.provider}-${opt.productName}-${index}`}
                      className="border-b border-(--border-subtle) last:border-0"
                    >
                      <td className="py-1.5 pr-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-(--text-primary)">
                            {opt.productName}
                          </span>
                        </div>
                      </td>
                      <td className="py-1.5 pr-3 text-[11px] text-(--text-secondary)">
                        {opt.provider}
                      </td>
                      <td className="py-1.5 pr-3 text-[11px] text-(--text-secondary)">
                        {opt.packSize} units
                      </td>
                      <td className="py-1.5 pr-3 text-[11px] text-(--text-primary)">
                        KES {opt.packPrice.toFixed(2)}
                      </td>
                      <td className="py-1.5 pr-3 text-[11px] text-(--text-primary)">
                        KES {opt.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-1.5 pr-3 text-[11px] text-(--text-secondary)">
                        {opt.availability === "in_stock"
                          ? "✅ In stock"
                          : opt.availability === "limited"
                          ? "⚠ Limited"
                          : opt.availability === "out_of_stock"
                          ? "❌ Out of stock"
                          : opt.availability || "Unknown"}
                      </td>
                      <td className="py-1.5 pr-3 text-right">
                        {opt.productUrl && (
                          <a
                            href={opt.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              type="button"
                              size="xs"
                              variant="ghost"
                            >
                              View
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

const ResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="h-4 w-40 rounded bg-(--surface-muted)" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 rounded-lg bg-(--surface-muted)" />
        <div className="h-20 rounded-lg bg-(--surface-muted)" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-(--surface-muted)" />
        <div className="h-16 rounded-lg bg-(--surface-muted)" />
        <div className="h-16 rounded-lg bg-(--surface-muted)" />
      </div>
      <p className="text-xs text-(--text-tertiary)">
        Searching pharmacies for your prescriptions…
      </p>
    </div>
  );
};

type ResultsErrorStateProps = {
  message: string;
};

const ResultsErrorState: React.FC<ResultsErrorStateProps> = ({
  message,
}) => {
  return (
    <div className="mt-4 rounded-lg bg-(--surface-muted) px-4 py-3 text-xs text-(--text-secondary)">
      <p className="font-medium text-(--text-primary)">Something went wrong</p>
      <p className="mt-1">{message}</p>
      <p className="mt-2 text-[11px] text-(--text-tertiary)">
        You can adjust your prescription above and try again.
      </p>
    </div>
  );
};

const ResultsEmptyState: React.FC = () => {
  return (
    <div className="mt-4 rounded-lg bg-(--surface-muted) px-4 py-3 text-xs text-(--text-secondary)">
      <p className="font-medium text-(--text-primary)">
        No pharmacies found
      </p>
      <p className="mt-1">
        We couldn’t find any results for your prescription.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px]">
        <li>Check the spelling of each medication.</li>
        <li>Try the generic name instead of the brand name.</li>
        <li>Remove the dosage and search again.</li>
      </ul>
      <p className="mt-2 text-[11px] text-(--text-tertiary)">
        You can edit your prescription above and run the search again.
      </p>
    </div>
  );
};