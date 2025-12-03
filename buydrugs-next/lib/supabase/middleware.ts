/**
 * Supabase Client for Middleware
 *
 * This client is specifically for Next.js middleware to handle
 * session refresh and auth state management between requests.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes logic (optional - can be customized)
  const isPublicRoute =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/sign-in') ||
    request.nextUrl.pathname.startsWith('/sign-up') ||
    request.nextUrl.pathname.startsWith('/complete-profile') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/design-system');

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Check for profile completion
  if (user && !isPublicRoute && request.nextUrl.pathname !== '/complete-profile') {
    const metadata = user.user_metadata || {};
    
    // Check for role-specific onboarding completion
    // A user might have completed onboarding for one role but not another
    const hasAnyCompletedOnboarding = 
      metadata.onboarding_complete === true ||
      metadata.onboarding_complete_customer === true ||
      metadata.onboarding_complete_pharmacy_admin === true ||
      metadata.onboarding_complete_pharmacy_staff === true;
    
    // If onboarding is explicitly set to false, redirect to completion page
    // This handles users who started onboarding but didn't complete it
    if (metadata.onboarding_complete === false && !hasAnyCompletedOnboarding) {
      const url = request.nextUrl.clone();
      url.pathname = '/complete-profile';
      return NextResponse.redirect(url);
    }
    
    // If onboarding_complete is undefined and no role-specific flags exist,
    // this might be a new user - let them access the app (they'll be prompted to complete profile if needed)
    // The complete-profile page will handle the actual onboarding flow
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.set(supabaseResponse.cookies)
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
