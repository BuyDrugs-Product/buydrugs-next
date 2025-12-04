"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { searchMedicationsAction } from "@/actions/search";
import {
    BatchSearchRequest,
    BatchSearchViewModel,
    buildViewModelFromResponse,
    mergeViewModels,
} from "@/lib/medicationGateway";

// Configuration with environment variable overrides
const SEARCH_CONFIG = {
    MAX_DURATION_MS:
        Number(process.env.NEXT_PUBLIC_MAX_DURATION_MS) || 30000,
    INITIAL_POLL_INTERVAL_MS:
        Number(process.env.NEXT_PUBLIC_INITIAL_POLL_INTERVAL_MS) || 2000,
    MAX_POLL_INTERVAL_MS:
        Number(process.env.NEXT_PUBLIC_MAX_POLL_INTERVAL_MS) || 5000,
    BACKOFF_MULTIPLIER:
        Number.parseFloat(process.env.NEXT_PUBLIC_BACKOFF_MULTIPLIER || "1.5") ||
        1.5,
    MIN_PROVIDERS_EXPECTED:
        Number(process.env.NEXT_PUBLIC_MIN_PROVIDERS_EXPECTED) || 2,
    MAX_RETRIES_PER_ITEM:
        Number(process.env.NEXT_PUBLIC_MAX_RETRIES_PER_ITEM) || 3,
};

// 3 Extra attempts on top of the standard configuration
const EXTRA_RETRY_BUFFER = 3;
const EXTRA_DURATION_BUFFER = 30000;

type SearchStatus = "idle" | "loading" | "success" | "error";

type UseMedicationSearchReturn = {
    startSearch: (request: BatchSearchRequest) => void;
    cancelSearch: () => void;
    viewModel: BatchSearchViewModel | null;
    status: SearchStatus;
    error: string | null;
    isRetrying: boolean;
    providerCount: number;
};

export function useMedicationSearch(): UseMedicationSearchReturn {
    // UI State (for rendering)
    const [viewModel, setViewModel] = useState<BatchSearchViewModel | null>(null);
    const [status, setStatus] = useState<SearchStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [providerCount, setProviderCount] = useState(0);

    // LOGIC State (Synchronous source of truth)
    // We use this to prevent the "stale state" issue seen in your logs
    const viewModelRef = useRef<BatchSearchViewModel | null>(null);

    // Refs for managing the polling loop
    const activeSearchId = useRef(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsRetrying(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const cancelSearch = useCallback(() => {
        cleanup();
        setStatus("idle");
        activeSearchId.current += 1; // Invalidate pending operations
    }, [cleanup]);

    const startSearch = useCallback(
        (initialRequest: BatchSearchRequest) => {
            // 1. Setup new search
            cleanup();
            const searchId = activeSearchId.current + 1;
            activeSearchId.current = searchId;
            startTimeRef.current = Date.now();

            // 2. Reset Both UI State and Logic Ref
            viewModelRef.current = null;
            setViewModel(null);

            setStatus("loading");
            setError(null);
            setProviderCount(0);
            setIsRetrying(false);

            // 3. Define the polling/retry step
            const executeStep = async (currentRequest: BatchSearchRequest, attempt: number) => {
                // Strict concurrency check
                if (activeSearchId.current !== searchId) return;

                try {
                    console.log(`📡 Request attempt ${attempt + 1} (Items: ${currentRequest.searches.length})...`);

                    const response = await searchMedicationsAction(currentRequest);

                    // Double check ID after await
                    if (activeSearchId.current !== searchId) return;

                    const newViewModel = buildViewModelFromResponse(response);

                    // --- SYNCHRONOUS MERGE ---
                    // Merge with the Ref (Logic Truth), not the State (UI Truth)
                    let mergedModel: BatchSearchViewModel;

                    if (viewModelRef.current) {
                        console.log("🔄 Merging partial results...");
                        mergedModel = mergeViewModels(viewModelRef.current, newViewModel);
                    } else {
                        mergedModel = newViewModel;
                    }

                    // Update Logic Ref immediately
                    viewModelRef.current = mergedModel;

                    // Update UI State (Async)
                    setViewModel(mergedModel);
                    setStatus("success");

                    // Calculate stats from the LATEST merged model
                    const allProviders = new Set(
                        mergedModel.perMedication.flatMap((m) =>
                            m.options.map((o) => o.provider)
                        )
                    );
                    setProviderCount(allProviders.size);

                    // --- Determine Incomplete Items using LATEST data ---
                    const incompleteSearches = mergedModel.perMedication
                        .filter((med) => {
                            const distinctProviders = new Set(med.options.map(o => o.provider)).size;
                            return distinctProviders < SEARCH_CONFIG.MIN_PROVIDERS_EXPECTED;
                        })
                        .map((med) => {
                            const originalItem = initialRequest.searches.find(
                                s => s.medication_name.toLowerCase() === med.query.toLowerCase() ||
                                    med.medicationKey.toLowerCase().includes(s.medication_name.toLowerCase())
                            );
                            return {
                                medication_name: originalItem?.medication_name || med.query,
                                quantity: originalItem?.quantity
                            };
                        });

                    // --- Decide: Stop or Retry? ---
                    const elapsed = Date.now() - startTimeRef.current;
                    const isTimeout = elapsed >= SEARCH_CONFIG.MAX_DURATION_MS + EXTRA_DURATION_BUFFER;

                    // Total allowed = Standard Config + Extra Buffer
                    const totalAllowedAttempts = SEARCH_CONFIG.MAX_RETRIES_PER_ITEM + EXTRA_RETRY_BUFFER;
                    const isMaxRetries = attempt >= totalAllowedAttempts - 1;

                    const isComplete = incompleteSearches.length === 0;

                    if (isComplete) {
                        console.log("✅ Search complete: All items fully resolved.");
                        setIsRetrying(false);
                        return;
                    }

                    if (isTimeout || isMaxRetries) {
                        console.log(
                            isTimeout
                                ? "🛑 Search complete: Timeout (Duration limit reached)."
                                : `🛑 Search complete: Max attempts reached (${totalAllowedAttempts}).`
                        );
                        setIsRetrying(false);
                        return;
                    }

                    // --- Schedule Next Poll ---
                    setIsRetrying(true);

                    const nextRequest: BatchSearchRequest = {
                        context: initialRequest.context,
                        searches: incompleteSearches
                    };

                    let nextDelay =
                        SEARCH_CONFIG.INITIAL_POLL_INTERVAL_MS *
                        Math.pow(SEARCH_CONFIG.BACKOFF_MULTIPLIER, attempt);

                    if (nextDelay > SEARCH_CONFIG.MAX_POLL_INTERVAL_MS) nextDelay = SEARCH_CONFIG.MAX_POLL_INTERVAL_MS;

                    console.log(`⏳ Gap found: ${incompleteSearches.length} items incomplete. Retrying in ${nextDelay}ms (Attempt ${attempt + 1}/${totalAllowedAttempts})...`);

                    timeoutRef.current = setTimeout(() => {
                        void executeStep(nextRequest, attempt + 1);
                    }, nextDelay);

                } catch (err) {
                    if (activeSearchId.current !== searchId) return;
                    console.error("Search step failed:", err);

                    if (attempt === 0 && !viewModelRef.current) {
                        setError(err instanceof Error ? err.message : "Search failed");
                        setStatus("error");
                        setIsRetrying(false);
                    } else {
                        // Retry strictly if time remains
                        const elapsed = Date.now() - startTimeRef.current;
                        if (elapsed < SEARCH_CONFIG.MAX_DURATION_MS) {
                            timeoutRef.current = setTimeout(() => {
                                void executeStep(currentRequest, attempt + 1);
                            }, SEARCH_CONFIG.INITIAL_POLL_INTERVAL_MS);
                        }
                    }
                }
            };

            // Start execution
            void executeStep(initialRequest, 0);
        },
        [cleanup]
    );

    return {
        startSearch,
        cancelSearch,
        viewModel,
        status,
        error,
        isRetrying,
        providerCount
    };
}