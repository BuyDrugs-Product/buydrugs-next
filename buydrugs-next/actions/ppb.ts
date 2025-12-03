/**
 * Server actions for PPB (Pharmacy and Poisons Board) verification services
 * These actions provide type-safe, server-side API calls for verifying:
 * - Pharmacy facilities
 * - Pharmacist licenses
 * - Pharmaceutical technician licenses
 */

'use server';

import { fetchPPB } from '@/lib/api/ppb-client';
import type { VerifyFacilityRequest, VerifyFacilityResponse } from '@/lib/types/facilities';
import type { VerifyPharmacistRequest, VerifyPharmacistResponse } from '@/lib/types/pharmacists';
import type { VerifyPharmtechRequest, VerifyPharmtechResponse } from '@/lib/types/pharmtechs';

/**
 * Verify a pharmacy facility using PPB number
 * Auto-populates pharmacy name, license type, status, and superintendent data
 * 
 * @param request - Facility verification request with PPB number
 * @returns Facility verification response with verified data
 * @throws Error if verification fails
 */
export async function verifyFacility(
    request: VerifyFacilityRequest
): Promise<VerifyFacilityResponse> {
    try {
        const response = await fetchPPB<VerifyFacilityResponse>(
            '/facilities/verify',
            {
                body: {
                    ppb_number: request.ppb_number.trim(),
                    use_cache: request.use_cache ?? true,
                },
            }
        );

        if (!response.success) {
            throw new Error(response.message || 'Facility verification failed');
        }

        return response;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred during facility verification'
        );
    }
}

/**
 * Verify a pharmacist license
 * Returns professional name, photo, status, and validity information
 * 
 * @param request - Pharmacist verification request with license number
 * @returns Pharmacist verification response with verified data
 * @throws Error if verification fails
 */
export async function verifyPharmacist(
    request: VerifyPharmacistRequest
): Promise<VerifyPharmacistResponse> {
    try {
        const response = await fetchPPB<VerifyPharmacistResponse>(
            '/pharmacists/verify',
            {
                body: {
                    license_number: request.license_number.trim().toUpperCase(),
                    use_cache: request.use_cache ?? true,
                },
            }
        );

        if (!response.success) {
            throw new Error(response.message || 'Pharmacist verification failed');
        }

        return response;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred during pharmacist verification'
        );
    }
}

/**
 * Verify a pharmaceutical technician license
 * Returns professional name, photo, status, and validity information
 * 
 * @param request - Pharmtech verification request with license number
 * @returns Pharmtech verification response with verified data
 * @throws Error if verification fails
 */
export async function verifyPharmtech(
    request: VerifyPharmtechRequest
): Promise<VerifyPharmtechResponse> {
    try {
        const response = await fetchPPB<VerifyPharmtechResponse>(
            '/pharmtechs/verify',
            {
                body: {
                    license_number: request.license_number.trim().toUpperCase(),
                    use_cache: request.use_cache ?? true,
                },
            }
        );

        if (!response.success) {
            throw new Error(response.message || 'Pharmaceutical technician verification failed');
        }

        return response;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : 'An unexpected error occurred during pharmaceutical technician verification'
        );
    }
}
