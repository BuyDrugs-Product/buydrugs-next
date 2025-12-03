import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

/**
 * Auth Callback Route Handler
 *
 * This route handles both OAuth callbacks and email confirmation redirects from Supabase.
 * - OAuth: Uses `code` parameter and exchanges it for a session
 * - Email confirmation (PKCE): Uses `token_hash` and `type` parameters and verifies OTP
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  // next is the URL to redirect to after sign in (if provided)
  const next = searchParams.get('next') ?? '/';

  const supabase = await createClient();
  let error: Error | null = null;

  // Handle OAuth callback (code parameter)
  if (code) {
    console.log('Exchanging code for session...');
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;

    if (error) {
      console.error('OAuth callback error:', error);
    } else if (result.data.user) {
      console.log('Session established for user:', result.data.user.id);

      const currentOnboardingStatus = result.data.user.user_metadata?.onboarding_complete;

      // Determine if this is a new user or returning user
      let shouldCompleteProfile = false;

      if (currentOnboardingStatus === undefined) {
        // New OAuth user - set onboarding as incomplete
        console.log('New OAuth user detected, setting onboarding_complete to false');
        try {
          if (result.data.session) {
            await supabase.auth.setSession(result.data.session);
          }

          const updateResult = await supabase.auth.updateUser({
            data: {
              onboarding_complete: false,
              onboarding_step: 'profile',
            }
          });

          if (updateResult.error) {
            console.error('Failed to update user metadata:', updateResult.error);
          } else {
            console.log('User metadata updated successfully');
            shouldCompleteProfile = true;
          }
        } catch (updateError) {
          console.error('Exception updating user metadata:', updateError);
        }
      } else if (currentOnboardingStatus === false) {
        // User previously started but didn't complete onboarding
        console.log('User has incomplete onboarding');
        shouldCompleteProfile = true;
      } else {
        // User has completed onboarding
        console.log('User has completed onboarding');
        shouldCompleteProfile = false;
      }

      // Redirect based on onboarding status
      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        let redirectUrl;
        if (shouldCompleteProfile) {
          // Redirect to profile completion
          redirectUrl = isLocalEnv
            ? `${origin}/complete-profile`
            : forwardedHost
              ? `https://${forwardedHost}/complete-profile`
              : `${origin}/complete-profile`;
        } else {
          // Redirect to next (usually home)
          redirectUrl = isLocalEnv
            ? `${origin}${next}`
            : forwardedHost
              ? `https://${forwardedHost}${next}`
              : `${origin}${next}`;
        }

        console.log('Redirecting to:', redirectUrl);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }
  // Handle email confirmation (PKCE flow with token_hash)
  else if (token_hash && type) {
    const result = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    error = result.error;
    if (error) {
      console.error('Email confirmation error:', error);
    }
  } else {
    // No valid auth parameters found
    console.error('Auth callback missing required parameters. Code:', !!code, 'Token hash:', !!token_hash, 'Type:', type);
  }

  if (!error) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
