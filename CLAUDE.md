# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a medication price comparison application built with Next.js 16. The main application is located in `design-system-showcase/` and enables users to search for prescription medications, compare prices across multiple pharmacy providers, and find nearby pharmacies with stock availability.

## Architecture

### Core Application Structure

The application follows Next.js 16 App Router conventions with a client-side heavy architecture:

```
design-system-showcase/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Header
│   └── page.tsx           # Main search interface (client component)
├── actions/               # Next.js Server Actions
│   └── search.ts          # Medication search server action
├── components/            # Reusable UI components (design system)
├── components/ui/         # Composite UI components
├── hooks/                 # React hooks
│   └── useMedicationSearch.ts  # Search state management with retry logic
├── lib/                   # Core business logic
│   └── medicationGateway.ts    # API client and data transformation
└── tests/                 # Test files (currently empty)
```

### Key Architectural Patterns

**1. Medication Search Gateway Integration**

The application integrates with a unified medication search API at `https://api.invictushealth.tech/catalog/gateway`. This is abstracted through `lib/medicationGateway.ts` which provides:

- Type definitions for all API requests/responses
- Request building helpers (`buildBatchSearchRequestFromUi`)
- Response transformation to view models (`buildViewModelFromResponse`)
- Store aggregation logic (`aggregateStoresFromBatch`)
- Result merging for progressive enhancement (`mergeViewModels`)

**2. Progressive Provider Retry Strategy**

The `useMedicationSearch` hook implements a sophisticated retry mechanism:
- Makes initial batch search request
- Analyzes results per medication to detect missing provider responses
- Automatically retries ONLY incomplete medications (gap filling)
- Uses exponential backoff (configurable via env vars)
- Merges results progressively to show partial data immediately
- Stops after max duration (30s) or max retries (3)

This is critical because pharmacy providers have varying response times, and the UX shows partial results while waiting for slower providers.

**3. Dual View Model Pattern**

Search results are transformed into two complementary views:
- **Per-Medication View**: Lists all options for each medication sorted by unit price
- **Aggregated Store View**: Groups results by pharmacy, shows which stores have all/partial medications

The store view prioritizes pharmacies that have ALL medications (sorted by total cost), then shows partial matches (sorted by medication count).

**4. Location-Aware Search**

The app prompts users for location permission on first search. When provided:
- Location context is included in batch search requests
- Results include distance to each pharmacy store
- Stores are sorted considering both stock completeness and distance

### Data Flow

1. User enters medications → `app/page.tsx` (MedicationRow state)
2. Click "Compare Prices" → Triggers `useMedicationSearch.startSearch()`
3. Hook calls `searchMedicationsAction()` server action
4. Server action fetches from Gateway API
5. Response transformed to `BatchSearchViewModel` in hook
6. View model rendered in two tabs: Pharmacies vs Medications
7. Hook continues polling for incomplete items (< 2 providers per medication)
8. New results merged into existing view model
9. UI updates progressively

## Common Commands

### Development

```bash
cd design-system-showcase
npm run dev          # Start dev server on localhost:3000
npm run build        # Production build
npm start            # Run production build
npm run lint         # Run ESLint
npm test             # Run Vitest tests
```

### Testing

Tests use Vitest with jsdom environment (configured in `vitest.config.mts`):
- Test files are in `design-system-showcase/tests/`
- Currently placeholder files exist but tests need implementation
- Use `npm test` to run all tests
- Test utilities should go in `tests/testUtils.ts`

## Environment Variables

Located in `design-system-showcase/.env` (see `.env.example` for template):

**API Configuration:**
- `NEXT_PUBLIC_GATEWAY_API_BASE_URL` - Override default Gateway API URL

**Search Behavior Tuning:**
- `NEXT_PUBLIC_MAX_DURATION_MS` (default: 30000) - Max time to retry incomplete searches
- `NEXT_PUBLIC_INITIAL_POLL_INTERVAL_MS` (default: 2000) - Initial delay before first retry
- `NEXT_PUBLIC_MAX_POLL_INTERVAL_MS` (default: 5000) - Max delay between retries
- `NEXT_PUBLIC_BACKOFF_MULTIPLIER` (default: 1.5) - Exponential backoff multiplier
- `NEXT_PUBLIC_MIN_PROVIDERS_EXPECTED` (default: 2) - Minimum providers per medication before considering complete
- `NEXT_PUBLIC_MAX_RETRIES_PER_ITEM` (default: 3) - Max retry attempts per incomplete medication

## Important Implementation Details

### TypeScript Path Aliases

The project uses `@/*` alias pointing to the `design-system-showcase/` root (configured in `tsconfig.json`). All imports use this convention:

```typescript
import { Button } from "@/components/Button";
import { searchMedicationsAction } from "@/actions/search";
import { buildBatchSearchRequestFromUi } from "@/lib/medicationGateway";
```

### Design System Components

The `components/` directory contains a custom design system with components like:
- Button, Card, Badge, Chip
- TextField, TextAreaField, SelectField
- SegmentedControl, RadioGroup, Checkbox, Toggle
- Avatar, Calendar, ProgressRing, NotificationItem

These follow consistent patterns:
- Accept variant/size props
- Use CSS variables for theming (e.g., `--text-primary`, `--surface-elevated`)
- Forward refs where appropriate
- Designed for light mode (dark mode not currently implemented)

### Server Actions vs Client API Calls

- `actions/search.ts` is a Next.js Server Action (marked with `"use server"`)
- It wraps the Gateway API fetch to enable server-side execution
- Cache control is set to `cache: "no-store"` to ensure fresh data
- Error handling provides user-friendly messages for 400/429 status codes

### Critical State Management in useMedicationSearch

The hook uses refs to prevent race conditions:
- `activeSearchId` - Incremented on each new search, used to ignore stale results
- `timeoutRef` - Stores setTimeout handle for cleanup
- `startTimeRef` - Tracks when search started for timeout logic

Always check `activeSearchId.current !== searchId` after async operations to prevent state updates from cancelled searches.

### Medication Data Aggregation

The `aggregateStoresFromBatch` function in `lib/medicationGateway.ts`:
- Flattens medication results by store location
- Keeps cheapest option when a store has multiple products for same medication
- Calculates total cost, medication count, and completeness flags
- Sorts stores: complete (by cost, then distance) → partial (by count, then distance)

This sorting logic is duplicated in `mergeViewModels` - keep them in sync when modifying.

## API Integration Reference

The Gateway API is documented in `external-integration-docs/FRONTEND_API_GUIDE.md`. Key points:

**Endpoint**: `POST /v1/batch-search`

**Request Format** (with location context):
```json
{
  "context": {
    "user_location": { "latitude": -1.286389, "longitude": 36.817223 },
    "max_distance_km": 10,
    "search_mode": "nearest_pharmacies",
    "sort_by": "distance"
  },
  "searches": [
    { "medication_name": "Panadol 500mg", "quantity": 10 }
  ]
}
```

**Response Structure**:
- `results` object keyed by medication name
- Each medication has `query`, `results[]` (products), `errors[]`
- Products include `stores[]` with location and distance when context provided
- Products sorted by `relevance_score`

## Git Branch Structure

- Current branch: `develop-1`
- No main branch configured (empty in git status)
- When creating PRs, confirm target branch with user

## Coding Patterns to Follow

**Component Patterns**:
- Main page uses local state + custom hook pattern (not Redux/Zustand)
- Child components receive callbacks via props (not context)
- Refs used for focus management (e.g., returning focus after adding medication)

**Styling**:
- Utility-first approach with Tailwind CSS
- CSS variables for theme colors (defined in `app/globals.css`)
- Responsive design with mobile-first breakpoints

**Data Validation**:
- Trimming user input before processing
- Filtering empty medications from batch requests
- Parsing quantity with `Number.parseInt` and checking `Number.isFinite`

**Accessibility**:
- `aria-live="polite"` regions for search status updates
- Focus management with refs (e.g., `headingRef` focuses on results)
- Semantic HTML (sections, headings, tables)

## Current State

Recent changes (from git status):
- Major updates to core search components (TextField, SelectField, SegmentedControl, TextAreaField)
- Layout and page implementations updated
- New actions, hooks, and UI components added
- Testing infrastructure added but not yet implemented
- Vitest configuration updated
- Medication gateway logic enhanced

The application is functional but test coverage needs implementation.
