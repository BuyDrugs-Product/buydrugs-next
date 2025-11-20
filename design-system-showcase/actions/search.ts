"use server";

import {
  BatchSearchRequest,
  BatchSearchResponse,
  GATEWAY_BASE_URL,
} from "@/lib/medicationGateway";

export async function searchMedicationsAction(
  request: BatchSearchRequest
): Promise<BatchSearchResponse> {
  // We can add server-side caching here later with unstable_cache
  // We can also add logging, analytics, etc.

  const response = await fetch(`${GATEWAY_BASE_URL}/v1/batch-search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    // Next.js 16 cache control:
    // We generally DON'T want to cache search results for too long if inventory changes,
    // but for 30s retry windows, we might want to avoid hitting the upstream API if we just did?
    // Actually, for "filling gaps", we WANT fresh data. So no cache.
    cache: "no-store", 
  });

  if (!response.ok) {
    if (response.status === 400) {
      // Try to parse detailed error
      let errorMessage = "Invalid request.";
      try {
        const payload = await response.json();
        errorMessage = payload?.details?.[0]?.message || payload?.error || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }
    throw new Error(`Search failed with status ${response.status}`);
  }

  return response.json();
}

