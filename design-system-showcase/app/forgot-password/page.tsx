'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { resetPassword } from '@/actions/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get('email') as string;
    setEmail(emailValue);

    try {
      const result = await resetPassword(emailValue);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-(--surface-app) px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/95 p-8 text-center shadow-(--shadow-card)">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-(--text-primary)">
              Check Your Email
            </h1>
            <p className="text-(--text-secondary)">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-(--text-tertiary)">
              If you don't see it, check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="inline-flex w-full items-center justify-center rounded-lg bg-(--action-primary) px-4 py-3 text-sm font-medium text-white hover:bg-(--action-primary-hover)"
            >
              Return to Sign In
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setError(null);
              }}
              className="w-full text-sm text-(--action-primary) hover:text-(--action-primary-hover)"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--surface-app) px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/95 p-8 shadow-(--shadow-card)">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-(--text-primary)">
            Forgot Password?
          </h1>
          <p className="text-(--text-secondary)">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <TextField
            type="email"
            id="email"
            name="email"
            label="Email address"
            required
            placeholder="you@example.com"
            className="bg-white"
          />

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isLoading}
            className="shadow-(--shadow-1)"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-sm text-(--text-tertiary)">
          Remember your password?{' '}
          <Link
            href="/sign-in"
            className="font-semibold text-(--action-primary) hover:text-(--action-primary-hover)"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
