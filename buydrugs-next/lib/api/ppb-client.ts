/**
 * Generic fetch wrapper for PPB (Pharmacy and Poisons Board) API
 * Provides error handling, request formatting, and caching support
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb';

/**
 * Generic fetch wrapper for PPB API
 * 
 * @param endpoint - API endpoint (e.g., '/facilities/verify')
 * @param options - Request options including method, body, and caching
 * @returns Typed API response
 * @throws Error if request fails or API returns error response
 */
export async function fetchPPB<T>(
    endpoint: string,
    options: {
        method?: 'GET' | 'POST';
        body?: unknown;
        use_cache?: boolean;
    } = {}
): Promise<T> {
    const { method = 'POST', body, use_cache = true } = options;
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
            // Next.js fetch caching
            next: {
                revalidate: use_cache ? 3600 : 0, // Cache for 1 hour if enabled
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                success: false,
                message: `HTTP ${response.status}: ${response.statusText}`,
                processing_time_ms: 0,
                data: null,
            }));
            throw new Error(errorData.message || 'Verification failed');
        }

        return response.json();
    } catch (error) {
        // Re-throw with additional context
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred during PPB API request');
    }
}
