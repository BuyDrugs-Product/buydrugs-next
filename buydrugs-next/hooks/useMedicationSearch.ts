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
  const [viewModel, setViewModel] = useState<BatchSearchViewModel | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [providerCount, setProviderCount] = useState(0);

  // Refs for managing the polling loop and race conditions
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
    activeSearchId.current += 1; // Invalidate any pending results
  }, [cleanup]);

  const startSearch = useCallback(
    (initialRequest: BatchSearchRequest) => {
      // 1. Setup new search
      cleanup();
      const searchId = activeSearchId.current + 1;
      activeSearchId.current = searchId;
      startTimeRef.current = Date.now();

      // 2. Reset State
      setViewModel(null);
      setStatus("loading");
      setError(null);
      setProviderCount(0);
      setIsRetrying(false);

      // 3. Define the polling/retry step
      // We pass the *current* request we want to execute.
      // Initially, it's the full list. In later steps, it's the gap list.
      const executeStep = async (currentRequest: BatchSearchRequest, attempt: number) => {
        // Check if search was cancelled or superseded
        if (activeSearchId.current !== searchId) return;

        try {
          console.log(`📡 Request attempt ${attempt + 1} (Items: ${currentRequest.searches.length})...`);
          
          const response = await searchMedicationsAction(currentRequest);

          // Double check ID after await (async gap)
          if (activeSearchId.current !== searchId) return;

          const newViewModel = buildViewModelFromResponse(response);
          
          // --- Update State (Merge) ---
          // We must use functional update to access the *latest* viewModel state for merging
          let updatedViewModel: BatchSearchViewModel | null = null;
          
          setViewModel((prev) => {
            if (prev) {
              console.log("🔄 Merging partial results...");
              updatedViewModel = mergeViewModels(prev, newViewModel);
              return updatedViewModel;
            }
            updatedViewModel = newViewModel;
            return newViewModel;
          });
          
          setStatus("success");

          // --- Analyze for Gaps (Itemized Reconciliation) ---
          // We need to check the *combined* state (updatedViewModel), not just the new response.
          // Wait, setViewModel is async/batched. We computed `updatedViewModel` locally above.
          
          if (!updatedViewModel) {
             // Should not happen, but fallback
             updatedViewModel = newViewModel; 
          }

          // Calculate global stats for UI
          const allProviders = new Set(
            updatedViewModel.perMedication.flatMap((m) =>
              m.options.map((o) => o.provider)
            )
          );
          setProviderCount(allProviders.size);

          // --- Determine Incomplete Items ---
          const incompleteSearches = updatedViewModel.perMedication
            .filter((med) => {
              // Count distinct providers for this specific medication
              const distinctProviders = new Set(med.options.map(o => o.provider)).size;
              // It is incomplete if < MIN_PROVIDERS (e.g. 2)
              // AND we haven't exhausted retries (we track global attempts for simplicity, 
              // but ideally we'd track per-item. For now, global attempt count < 3 is the gate).
              return distinctProviders < SEARCH_CONFIG.MIN_PROVIDERS_EXPECTED;
            })
            .map((med) => {
               // We need to map back to the original search query format
               // We assume the 'query' field in ViewModel matches the input name roughly,
               // but safer to look up from the *original* request if possible.
               // For now, we use the `query` string from the view model which comes from the API response.
               
               // Optimization: We can extract the quantity from the original request if needed,
               // but the API likely returned it.
               // Let's look for the matching original search item to preserve exact naming/quantity.
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
          const isTimeout = elapsed >= SEARCH_CONFIG.MAX_DURATION_MS;
          const isMaxRetries = attempt >= SEARCH_CONFIG.MAX_RETRIES_PER_ITEM - 1; // 0-based index
          const isComplete = incompleteSearches.length === 0;

          if (isComplete) {
            console.log("✅ Search complete: All items fully resolved.");
            setIsRetrying(false);
            return;
          }

          if (isTimeout || isMaxRetries) {
             console.log(
               isTimeout 
                 ? "🛑 Search complete: Timeout." 
                 : "🛑 Search complete: Max retries reached."
             );
             setIsRetrying(false);
             return;
          }

          // --- Schedule Next Poll (Selective Retry) ---
          setIsRetrying(true);
          
          // Construct the next request with ONLY the incomplete items
          const nextRequest: BatchSearchRequest = {
            context: initialRequest.context, // Preserve location context
            searches: incompleteSearches
          };

          let nextDelay =
            SEARCH_CONFIG.INITIAL_POLL_INTERVAL_MS *
            Math.pow(SEARCH_CONFIG.BACKOFF_MULTIPLIER, attempt);
            
          if (nextDelay > SEARCH_CONFIG.MAX_POLL_INTERVAL_MS) nextDelay = SEARCH_CONFIG.MAX_POLL_INTERVAL_MS;

          console.log(`⏳ Gap found: ${incompleteSearches.length} items incomplete. Retrying in ${nextDelay}ms...`);
          
          timeoutRef.current = setTimeout(() => {
            void executeStep(nextRequest, attempt + 1);
          }, nextDelay);

        } catch (err) {
           // Error handling remains similar - retry if transient
           if (activeSearchId.current !== searchId) return;
           console.error("Search step failed:", err);
           
           // If first attempt failed completely, show error
           if (attempt === 0 && !viewModel) {
             setError(err instanceof Error ? err.message : "Search failed");
             setStatus("error");
             setIsRetrying(false);
           } else {
             // Swallow error and try again? Or stop? 
             // Let's try one more time with the SAME request if it was a network error
             // But don't increment attempt counter to avoid burning a "strike" on a network glitch?
             // For safety, let's just continue to next attempt with backoff.
             const elapsed = Date.now() - startTimeRef.current;
             if (elapsed < SEARCH_CONFIG.MAX_DURATION_MS) {
                timeoutRef.current = setTimeout(() => {
                   void executeStep(currentRequest, attempt + 1);
                }, SEARCH_CONFIG.INITIAL_POLL_INTERVAL_MS);
             }
           }
        }
      };

      // Start with full request
      void executeStep(initialRequest, 0);
    },
    [cleanup, viewModel] 
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
