/**
 * Supabase Client for Browser (Client Components)
 *
 * This client is used in Client Components and provides access to Supabase
 * with automatic session management via cookies.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
