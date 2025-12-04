'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Authentication Server Actions
 *
 * These server actions handle all authentication operations including
 * sign in, sign up, sign out, and password reset flows.
 */

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Sign in with email and password
 * 
 * @returns AuthResult on error, or redirects to '/' on success (does not return)
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult | void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Check your email to confirm your account.',
  };
}

/**
 * Sign out the current user
 * 
 * @returns AuthResult on error, or redirects to '/sign-in' on success (does not return)
 */
export async function signOut(): Promise<AuthResult | void> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Check your email for the password reset link.',
  };
}

/**
 * Update user password (used after reset)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Password updated successfully.',
  };
}

/**
 * Sign in with OAuth provider (Google, etc.)
 * 
 * @returns AuthResult on error, or redirects to OAuth provider on success (does not return)
 */
export async function signInWithOAuth(provider: 'google' | 'github' | 'azure'): Promise<AuthResult | void> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // If we don't have a URL, return an error
  if (!data.url) {
    return {
      success: false,
      error: 'Failed to get OAuth URL',
    };
  }

  // Redirect to OAuth provider (this throws and never returns)
  redirect(data.url);
}

/**
 * Get the current user (for use in Server Components)
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

/**
 * Check if user is authenticated (for use in Server Components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
