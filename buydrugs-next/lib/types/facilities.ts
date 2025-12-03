/**
 * TypeScript types for PPB Facilities Verification Service
 */

import type { PPBBaseResponse } from './ppb';

/**
 * Request body for facility verification
 */
export interface VerifyFacilityRequest {
    ppb_number: string;
    use_cache?: boolean;
}

/**
 * Superintendent information from facility verification
 */
export interface Superintendent {
    name: string;
    cadre: string;
    enrollment_number: string;
    license_number: string;
}

/**
 * Facility verification data returned from PPB API
 */
export interface FacilityData {
    facility_name: string;
    license_number: string;
    license_status: string;
    license_type: string;
    superintendent: Superintendent;
    // Additional fields may be present based on PPB portal data
    [key: string]: unknown;
}

/**
 * Complete facility verification response
 */
export interface VerifyFacilityResponse extends PPBBaseResponse<FacilityData> {
    ppb_number: string;
}
