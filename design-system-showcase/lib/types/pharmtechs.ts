/**
 * TypeScript types for PPB Pharmaceutical Technicians Verification Service
 */

import type { PPBBaseResponse } from './ppb';

/**
 * Request body for pharmaceutical technician verification
 */
export interface VerifyPharmtechRequest {
    license_number: string;
    use_cache?: boolean;
}

/**
 * Pharmaceutical technician verification data returned from PPB API
 */
export interface PharmtechData {
    full_name: string;
    practice_license_number: string;
    status: string;
    valid_till: string; // ISO date string (YYYY-MM-DD)
    photo_url: string;
    verified_at: string; // ISO datetime string
}

/**
 * Complete pharmaceutical technician verification response
 */
export interface VerifyPharmtechResponse extends PPBBaseResponse<PharmtechData> {
    license_number: string;
}
