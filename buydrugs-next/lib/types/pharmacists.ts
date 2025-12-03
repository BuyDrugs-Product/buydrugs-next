/**
 * TypeScript types for PPB Pharmacists Verification Service
 */

import type { PPBBaseResponse } from './ppb';

/**
 * Request body for pharmacist verification
 */
export interface VerifyPharmacistRequest {
    license_number: string;
    use_cache?: boolean;
}

/**
 * Pharmacist verification data returned from PPB API
 */
export interface PharmacistData {
    full_name: string;
    practice_license_number: string;
    status: string;
    valid_till: string; // ISO date string (YYYY-MM-DD)
    photo_url: string;
    verified_at: string; // ISO datetime string
}

/**
 * Complete pharmacist verification response
 */
export interface VerifyPharmacistResponse extends PPBBaseResponse<PharmacistData> {
    license_number: string;
}
