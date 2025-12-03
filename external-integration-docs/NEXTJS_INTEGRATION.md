# Next.js 16 Integration Guide for PPB Verification Microservices

Complete integration guide for integrating Kenya Pharmacy and Poisons Board (PPB) verification microservices into your Next.js 16 application using the App Router.

## Table of Contents

- [API Configuration](#api-configuration)
- [TypeScript Types](#typescript-types)
- [Implementation Patterns](#implementation-patterns)
  - [Server Actions (Recommended)](#server-actions-recommended)
  - [Route Handlers (Alternative)](#route-handlers-alternative)
  - [Client Components](#client-components)
- [Service-Specific Examples](#service-specific-examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## API Configuration

### Base URL

All verification services are hosted at:

```
https://api.invictushealth.tech/v1/ppb
```

### Service Endpoints

| Service | Endpoint | Method | Request Field |
|---------|----------|--------|----------------|
| **Facilities** | `https://api.invictushealth.tech/v1/ppb/facilities/verify` | POST | `ppb_number` |
| **Pharmacists** | `https://api.invictushealth.tech/v1/ppb/pharmacists/verify` | POST | `license_number` |
| **Pharmtechs** | `https://api.invictushealth.tech/v1/ppb/pharmtechs/verify` | POST | `license_number` |

### Environment Variables

Create a `.env.local` file in your Next.js project root:

```bash
NEXT_PUBLIC_PPB_API_BASE_URL=https://api.invictushealth.tech/v1/ppb
```

## TypeScript Types

### Common Types

```typescript
// lib/types/ppb.ts

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
 * Request options
 */
export interface PPBRequestOptions {
  use_cache?: boolean;
}
```

### Facilities Service Types

```typescript
// lib/types/facilities.ts

/**
 * Request body for facility verification
 */
export interface VerifyFacilityRequest {
  ppb_number: string;
  use_cache?: boolean;
}

/**
 * Superintendent information
 */
export interface Superintendent {
  name: string;
  cadre: string;
  enrollment_number: string;
}

/**
 * Facility verification data
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
 * Facility verification response
 */
export interface VerifyFacilityResponse extends PPBBaseResponse<FacilityData> {
  ppb_number: string;
}
```

### Pharmacists Service Types

```typescript
// lib/types/pharmacists.ts

/**
 * Request body for pharmacist verification
 */
export interface VerifyPharmacistRequest {
  license_number: string;
  use_cache?: boolean;
}

/**
 * Pharmacist verification data
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
 * Pharmacist verification response
 */
export interface VerifyPharmacistResponse extends PPBBaseResponse<PharmacistData> {
  license_number: string;
}
```

### Pharmtechs Service Types

```typescript
// lib/types/pharmtechs.ts

/**
 * Request body for pharmtech verification
 */
export interface VerifyPharmtechRequest {
  license_number: string;
  use_cache?: boolean;
}

/**
 * Pharmtech verification data
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
 * Pharmtech verification response
 */
export interface VerifyPharmtechResponse extends PPBBaseResponse<PharmtechData> {
  license_number: string;
}
```

## Implementation Patterns

### Server Actions (Recommended)

Server Actions are the recommended approach for Next.js 16 App Router as they provide:
- Type safety
- Automatic request/response serialization
- Server-side execution (no API route needed)
- Built-in error handling

#### Setup: API Client Utility

```typescript
// lib/api/ppb-client.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb';

/**
 * Generic fetch wrapper for PPB API
 */
async function fetchPPB<T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
    use_cache?: boolean;
  } = {}
): Promise<T> {
  const { method = 'POST', body, use_cache = true } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  
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
}
```

#### Facilities Verification Server Action

```typescript
// app/actions/facilities.ts

'use server';

import { fetchPPB } from '@/lib/api/ppb-client';
import type { VerifyFacilityRequest, VerifyFacilityResponse } from '@/lib/types/facilities';

/**
 * Verify a facility license
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
```

#### Pharmacists Verification Server Action

```typescript
// app/actions/pharmacists.ts

'use server';

import { fetchPPB } from '@/lib/api/ppb-client';
import type { VerifyPharmacistRequest, VerifyPharmacistResponse } from '@/lib/types/pharmacists';

/**
 * Verify a pharmacist license
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
```

#### Pharmtechs Verification Server Action

```typescript
// app/actions/pharmtechs.ts

'use server';

import { fetchPPB } from '@/lib/api/ppb-client';
import type { VerifyPharmtechRequest, VerifyPharmtechResponse } from '@/lib/types/pharmtechs';

/**
 * Verify a pharmtech license
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
      throw new Error(response.message || 'Pharmtech verification failed');
    }

    return response;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during pharmtech verification'
    );
  }
}
```

### Route Handlers (Alternative)

Route Handlers provide an alternative approach if you need to proxy requests or add custom middleware.

#### Facilities Route Handler

```typescript
// app/api/ppb/facilities/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { VerifyFacilityRequest, VerifyFacilityResponse } from '@/lib/types/facilities';

const API_BASE_URL = process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyFacilityRequest = await request.json();

    // Validate request
    if (!body.ppb_number || typeof body.ppb_number !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'ppb_number is required',
          processing_time_ms: 0,
          data: null,
        },
        { status: 400 }
      );
    }

    // Forward request to PPB API
    const response = await fetch(`${API_BASE_URL}/facilities/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ppb_number: body.ppb_number.trim(),
        use_cache: body.use_cache ?? true,
      }),
    });

    const data: VerifyFacilityResponse = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(data, { status: response.status || 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        processing_time_ms: 0,
        data: null,
      },
      { status: 500 }
    );
  }
}
```

#### Pharmacists Route Handler

```typescript
// app/api/ppb/pharmacists/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { VerifyPharmacistRequest, VerifyPharmacistResponse } from '@/lib/types/pharmacists';

const API_BASE_URL = process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPharmacistRequest = await request.json();

    if (!body.license_number || typeof body.license_number !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'license_number is required',
          processing_time_ms: 0,
          data: null,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/pharmacists/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_number: body.license_number.trim().toUpperCase(),
        use_cache: body.use_cache ?? true,
      }),
    });

    const data: VerifyPharmacistResponse = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(data, { status: response.status || 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        processing_time_ms: 0,
        data: null,
      },
      { status: 500 }
    );
  }
}
```

#### Pharmtechs Route Handler

```typescript
// app/api/ppb/pharmtechs/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import type { VerifyPharmtechRequest, VerifyPharmtechResponse } from '@/lib/types/pharmtechs';

const API_BASE_URL = process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPharmtechRequest = await request.json();

    if (!body.license_number || typeof body.license_number !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'license_number is required',
          processing_time_ms: 0,
          data: null,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/pharmtechs/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license_number: body.license_number.trim().toUpperCase(),
        use_cache: body.use_cache ?? true,
      }),
    });

    const data: VerifyPharmtechResponse = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(data, { status: response.status || 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        processing_time_ms: 0,
        data: null,
      },
      { status: 500 }
    );
  }
}
```

### Client Components

#### Facilities Verification Form Component

```typescript
// app/components/FacilityVerificationForm.tsx

'use client';

import { useState } from 'react';
import { verifyFacility } from '@/app/actions/facilities';
import type { VerifyFacilityResponse } from '@/lib/types/facilities';

export function FacilityVerificationForm() {
  const [ppbNumber, setPpbNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyFacilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyFacility({
        ppb_number: ppbNumber,
        use_cache: true,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ppb_number" className="block text-sm font-medium">
            PPB Number
          </label>
          <input
            id="ppb_number"
            type="text"
            value={ppbNumber}
            onChange={(e) => setPpbNumber(e.target.value)}
            placeholder="PPB/C/9222"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Facility'}
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {result?.success && result.data && (
        <div className="rounded-md bg-green-50 p-4 space-y-2">
          <h3 className="font-semibold text-lg">
            {result.data.facility_name}
          </h3>
          <p>License: {result.data.license_number}</p>
          <p>Status: {result.data.license_status}</p>
          <p>Type: {result.data.license_type}</p>
          {result.data.superintendent && (
            <div className="mt-2 pt-2 border-t">
              <p className="font-semibold">Superintendent:</p>
              <p>Name: {result.data.superintendent.name}</p>
              <p>Cadre: {result.data.superintendent.cadre}</p>
              <p>Enrollment: {result.data.superintendent.enrollment_number}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Processed in {result.processing_time_ms.toFixed(2)}ms
            {result.from_cache && ' (from cache)'}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### Pharmacists Verification Form Component

```typescript
// app/components/PharmacistVerificationForm.tsx

'use client';

import { useState } from 'react';
import { verifyPharmacist } from '@/app/actions/pharmacists';
import type { VerifyPharmacistResponse } from '@/lib/types/pharmacists';
import Image from 'next/image';

export function PharmacistVerificationForm() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyPharmacistResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyPharmacist({
        license_number: licenseNumber,
        use_cache: true,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="license_number" className="block text-sm font-medium">
            License Number
          </label>
          <input
            id="license_number"
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="P2025D00463"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Pharmacist'}
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {result?.success && result.data && (
        <div className="rounded-md bg-green-50 p-4 space-y-4">
          <div className="flex gap-4">
            {result.data.photo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={result.data.photo_url}
                  alt={result.data.full_name}
                  width={120}
                  height={120}
                  className="rounded-md"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {result.data.full_name}
              </h3>
              <p>License: {result.data.practice_license_number}</p>
              <p>Status: {result.data.status}</p>
              <p>Valid Until: {result.data.valid_till}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Processed in {result.processing_time_ms.toFixed(2)}ms
            {result.from_cache && ' (from cache)'}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### Pharmtechs Verification Form Component

```typescript
// app/components/PharmtechVerificationForm.tsx

'use client';

import { useState } from 'react';
import { verifyPharmtech } from '@/app/actions/pharmtechs';
import type { VerifyPharmtechResponse } from '@/lib/types/pharmtechs';
import Image from 'next/image';

export function PharmtechVerificationForm() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyPharmtechResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyPharmtech({
        license_number: licenseNumber,
        use_cache: true,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Verification failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="license_number" className="block text-sm font-medium">
            License Number
          </label>
          <input
            id="license_number"
            type="text"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            placeholder="PT2025D05614"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify Pharmtech'}
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {result?.success && result.data && (
        <div className="rounded-md bg-green-50 p-4 space-y-4">
          <div className="flex gap-4">
            {result.data.photo_url && (
              <div className="flex-shrink-0">
                <Image
                  src={result.data.photo_url}
                  alt={result.data.full_name}
                  width={120}
                  height={120}
                  className="rounded-md"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {result.data.full_name}
              </h3>
              <p>License: {result.data.practice_license_number}</p>
              <p>Status: {result.data.status}</p>
              <p>Valid Until: {result.data.valid_till}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Processed in {result.processing_time_ms.toFixed(2)}ms
            {result.from_cache && ' (from cache)'}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Service-Specific Examples

### Facilities Service

**Request Format:**
```json
{
  "ppb_number": "PPB/C/9222",
  "use_cache": true
}
```

**Response Structure:**
```typescript
{
  success: true;
  ppb_number: "PPB/C/9222";
  processing_time_ms: 3200.45;
  from_cache: false;
  data: {
    facility_name: "CARING-WAY PHARMA (Kiambu)";
    license_number: "BU202511914";
    license_status: "VALID";
    license_type: "RETAIL";
    superintendent: {
      name: "KIVUVA";
      cadre: "PHARMTECH";
      enrollment_number: "12832";
    };
  };
}
```

**Usage Example:**
```typescript
import { verifyFacility } from '@/app/actions/facilities';

const result = await verifyFacility({
  ppb_number: 'PPB/C/9222',
  use_cache: true,
});

if (result.success && result.data) {
  console.log(result.data.facility_name);
  console.log(result.data.superintendent.name);
}
```

### Pharmacists Service

**Request Format:**
```json
{
  "license_number": "P2025D00463",
  "use_cache": true
}
```

**Response Structure:**
```typescript
{
  success: true;
  license_number: "P2025D00463";
  message: "Pharmacist verification successful";
  processing_time_ms: 920.50;
  from_cache: false;
  data: {
    full_name: "Gesare Achei Beryl";
    practice_license_number: "P2025D00463";
    status: "Active";
    valid_till: "2025-12-31";
    photo_url: "http://rhris.pharmacyboardkenya.org/photos/...";
    verified_at: "2025-10-15T12:00:00Z";
  };
}
```

**Usage Example:**
```typescript
import { verifyPharmacist } from '@/app/actions/pharmacists';

const result = await verifyPharmacist({
  license_number: 'P2025D00463',
  use_cache: true,
});

if (result.success && result.data) {
  console.log(result.data.full_name);
  console.log(result.data.photo_url);
}
```

### Pharmtechs Service

**Request Format:**
```json
{
  "license_number": "PT2025D05614",
  "use_cache": true
}
```

**Response Structure:**
```typescript
{
  success: true;
  license_number: "PT2025D05614";
  message: "PharmTech verification successful";
  processing_time_ms: 1850.25;
  from_cache: false;
  data: {
    full_name: "Changwony Gloria";
    practice_license_number: "PT2025D05614";
    status: "Active";
    valid_till: "2025-12-31";
    photo_url: "http://rhris.pharmacyboardkenya.org/photos/...";
    verified_at: "2025-10-15T12:00:00Z";
  };
}
```

**Usage Example:**
```typescript
import { verifyPharmtech } from '@/app/actions/pharmtechs';

const result = await verifyPharmtech({
  license_number: 'PT2025D05614',
  use_cache: true,
});

if (result.success && result.data) {
  console.log(result.data.full_name);
  console.log(result.data.photo_url);
}
```

## Error Handling

### HTTP Status Codes

The verification services return standard HTTP status codes:

- **200 OK**: Verification successful
- **400 Bad Request**: Invalid request format or license number format
- **404 Not Found**: License/PPB number not found in registry
- **500 Internal Server Error**: Server error or PPB portal unavailable

### Error Response Structure

All error responses follow this structure:

```typescript
{
  success: false;
  message: string; // Human-readable error message
  processing_time_ms: number;
  from_cache?: boolean;
  data: null;
}
```

### Error Handling Example

```typescript
// lib/utils/error-handler.ts

export class PPBVerificationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public processingTime: number
  ) {
    super(message);
    this.name = 'PPBVerificationError';
  }
}

export function handlePPBError(error: unknown): PPBVerificationError {
  if (error instanceof PPBVerificationError) {
    return error;
  }

  if (error instanceof Error) {
    return new PPBVerificationError(error.message, 500, 0);
  }

  return new PPBVerificationError(
    'An unexpected error occurred',
    500,
    0
  );
}
```

### Error Handling in Server Actions

```typescript
// app/actions/facilities.ts (enhanced with error handling)

'use server';

import { fetchPPB } from '@/lib/api/ppb-client';
import { handlePPBError } from '@/lib/utils/error-handler';
import type { VerifyFacilityRequest, VerifyFacilityResponse } from '@/lib/types/facilities';

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
      throw handlePPBError(
        new Error(response.message || 'Facility verification failed')
      );
    }

    return response;
  } catch (error) {
    const ppbError = handlePPBError(error);
    throw ppbError;
  }
}
```

### Error Handling in Client Components

```typescript
// Enhanced form component with comprehensive error handling

'use client';

import { useState } from 'react';
import { verifyFacility } from '@/app/actions/facilities';
import type { VerifyFacilityResponse } from '@/lib/types/facilities';

export function FacilityVerificationForm() {
  const [ppbNumber, setPpbNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyFacilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await verifyFacility({
        ppb_number: ppbNumber,
        use_cache: true,
      });
      
      if (response.success) {
        setResult(response);
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err) {
      // Handle different error types
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

## Best Practices

### 1. Environment Variables

Always use environment variables for API configuration:

```bash
# .env.local
NEXT_PUBLIC_PPB_API_BASE_URL=https://api.invictushealth.tech/v1/ppb
```

```typescript
// lib/config.ts
export const PPB_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_PPB_API_BASE_URL || 'https://api.invictushealth.tech/v1/ppb',
  defaultCache: true,
  cacheRevalidate: 3600, // 1 hour
} as const;
```

### 2. Caching Strategies

#### Next.js Built-in Caching

```typescript
// Server Actions with Next.js fetch caching
const response = await fetch(url, {
  next: {
    revalidate: 3600, // Cache for 1 hour
  },
});
```

#### React Query (Recommended for Client Components)

```typescript
// lib/hooks/use-facility-verification.ts

import { useMutation } from '@tanstack/react-query';
import { verifyFacility } from '@/app/actions/facilities';
import type { VerifyFacilityRequest } from '@/lib/types/facilities';

export function useFacilityVerification() {
  return useMutation({
    mutationFn: (request: VerifyFacilityRequest) => verifyFacility(request),
    onError: (error) => {
      console.error('Facility verification failed:', error);
    },
  });
}
```

#### SWR Alternative

```typescript
// lib/hooks/use-pharmacist-verification.ts

import useSWRMutation from 'swr/mutation';
import { verifyPharmacist } from '@/app/actions/pharmacists';
import type { VerifyPharmacistRequest } from '@/lib/types/pharmacists';

async function verifyPharmacistFetcher(
  _key: string,
  { arg }: { arg: VerifyPharmacistRequest }
) {
  return verifyPharmacist(arg);
}

export function usePharmacistVerification() {
  return useSWRMutation(
    'pharmacist-verification',
    verifyPharmacistFetcher
  );
}
```

### 3. Input Validation

Always validate and sanitize inputs:

```typescript
// lib/utils/validation.ts

/**
 * Validate PPB facility number format
 */
export function validatePPBNumber(ppbNumber: string): boolean {
  // Format: PPB/C/9222 or similar
  const pattern = /^PPB\/[A-Z]\/\d+$/i;
  return pattern.test(ppbNumber.trim());
}

/**
 * Validate pharmacist license number format
 */
export function validatePharmacistLicense(license: string): boolean {
  // Format: PYYYYXNNNNN (e.g., P2025D00463)
  const pattern = /^P\d{4}[A-Z]\d{5}$/i;
  return pattern.test(license.trim());
}

/**
 * Validate pharmtech license number format
 */
export function validatePharmtechLicense(license: string): boolean {
  // Format: PTYYYYXNNNNN (e.g., PT2025D05614)
  const pattern = /^PT\d{4}[A-Z]\d{5}$/i;
  return pattern.test(license.trim());
}
```

### 4. Type Safety

Use TypeScript strictly throughout:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
  }
}
```

### 5. Loading States

Always provide user feedback:

```typescript
// Enhanced loading state component
export function VerificationButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          Verifying...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

### 6. Error Boundaries

Wrap verification components in error boundaries:

```typescript
// app/components/VerificationErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class VerificationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Verification error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-md bg-red-50 p-4">
          <h3 className="font-semibold text-red-800">Verification Error</h3>
          <p className="text-red-600">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 7. Performance Optimization

- Use Server Actions for server-side verification (reduces client bundle size)
- Implement request debouncing for search inputs
- Cache results appropriately (1 hour default)
- Use React.memo for expensive components

```typescript
// Debounced verification hook
import { useDebouncedCallback } from 'use-debounce';

export function useDebouncedVerification() {
  const [value, setValue] = useState('');
  const debounced = useDebouncedCallback(
    (val: string) => {
      // Trigger verification
    },
    500 // 500ms delay
  );

  return { value, setValue, debounced };
}
```

### 8. Testing

Example test with Jest and React Testing Library:

```typescript
// __tests__/facility-verification.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { FacilityVerificationForm } from '@/app/components/FacilityVerificationForm';
import { verifyFacility } from '@/app/actions/facilities';

jest.mock('@/app/actions/facilities');

describe('FacilityVerificationForm', () => {
  it('verifies facility successfully', async () => {
    const mockVerify = verifyFacility as jest.MockedFunction<typeof verifyFacility>;
    mockVerify.mockResolvedValue({
      success: true,
      ppb_number: 'PPB/C/9222',
      processing_time_ms: 100,
      data: {
        facility_name: 'Test Facility',
        license_number: 'BU202511914',
        license_status: 'VALID',
        license_type: 'RETAIL',
        superintendent: {
          name: 'Test Name',
          cadre: 'PHARMTECH',
          enrollment_number: '12345',
        },
      },
    });

    render(<FacilityVerificationForm />);

    // Test form submission
    const input = screen.getByLabelText(/ppb number/i);
    const button = screen.getByRole('button', { name: /verify/i });

    // ... test implementation
  });
});
```

## Summary

This integration guide provides:

1. ✅ Complete TypeScript type definitions for all three services
2. ✅ Server Actions implementation (recommended)
3. ✅ Route Handlers implementation (alternative)
4. ✅ Client component examples with forms
5. ✅ Comprehensive error handling
6. ✅ Best practices for caching, validation, and performance

**Quick Start Checklist:**

- [ ] Add environment variable `NEXT_PUBLIC_PPB_API_BASE_URL`
- [ ] Copy TypeScript types to `lib/types/`
- [ ] Create API client utility in `lib/api/ppb-client.ts`
- [ ] Create Server Actions in `app/actions/`
- [ ] Create form components in `app/components/`
- [ ] Add error handling utilities
- [ ] Implement input validation
- [ ] Add loading states and error boundaries

For questions or issues, refer to the individual service README files:
- [Facilities README](../facilities/README.md)
- [Pharmacists README](../pharmacists/README.md)
- [Pharmtechs README](../pharmtechs/README.md)


