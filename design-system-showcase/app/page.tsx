"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TextField } from "@/components/TextField";

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
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationPromptVisible, setLocationPromptVisible] = useState(false);
  const [pendingSearchMedications, setPendingSearchMedications] = useState<
    MedicationRow[] | null
  >(null);
  const [hasSeenLocationPrompt, setHasSeenLocationPrompt] = useState(false);

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
  const startSearch = async (
    payload: MedicationRow[],
    locationOverride?: { lat: number; lng: number } | null
  ) => {
    if (!payload.length) return;

    setIsSearching(true);

    const searchPayload = {
      medications: payload,
      location: locationOverride ?? location,
    };

    // This is where a webhook/API call will go in the future.
    console.log(
      "Mock search payload (ready for webhook):",
      JSON.stringify(searchPayload, null, 2)
    );

    // Simulate network/search latency.
    await new Promise((resolve) => setTimeout(resolve, 5000));

    setIsSearching(false);
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
                    <span className="ml-2">Comparing prices…</span>
                  </>
                ) : (
                  "Compare Prices Now"
                )}
              </Button>
            </div>
          </Card>
        </section>
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

