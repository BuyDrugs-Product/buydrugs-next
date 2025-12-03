/**
 * Base TypeScript types for PPB (Pharmacy and Poisons Board) verification services
 * Common types shared across all PPB API endpoints
 */

/**
 * Base response wrapper for all verification services
 */
export interface PPBBaseResponse<T> {
    success: boolean;
    message?: string;
    processing_time_ms: number;
    from_cache?: boolean;
    data: T | null;
}

/**
 * Error response structure
 */
export interface PPBErrorResponse {
    success: false;
    message: string;
    processing_time_ms: number;
    from_cache?: boolean;
    data: null;
}

/**
 * Request options for PPB API calls
 */
export interface PPBRequestOptions {
    use_cache?: boolean;
}
