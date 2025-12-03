'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInPage, Testimonial } from '@/components/ui/sign-in';
import { createClient } from '@/lib/supabase/client';

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "BuyDrugs helped me save 40% on my monthly prescriptions. The price comparison is incredibly accurate and the pharmacy locations are always up to date."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcusj",
    text: "As someone managing multiple medications, this platform has been a lifesaver. I can quickly find which pharmacy has everything in stock."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/32.jpg",
    name: "Lisa Martinez",
    handle: "@lisamedtech",
    text: "The real-time stock updates are game-changing. No more driving to multiple pharmacies only to find they're out of stock."
  },
];

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Sign-in successful
        setIsLoading(false); // Reset loading state before navigation
        await router.push('/');
        router.refresh(); // Force a refresh to update server components
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // OAuth will redirect to the provider's login page
      // No need to do anything else here
    } catch (err) {
      console.error('Google sign in error:', err);
      setError('Failed to initialize Google sign in. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    router.push('/forgot-password');
  };

  const handleCreateAccount = () => {
    router.push('/sign-up');
  };

  return (
    <div className="bg-background text-foreground">
      {error && (
        <div
          className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 transform rounded-lg bg-red-50 p-4 shadow-lg"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto shrink-0 text-red-600 hover:text-red-800"
              aria-label="Dismiss error"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <SignInPage
        title={
          <span>
            Welcome to <span className="text-primary">BuyDrugs</span>
          </span>
        }
        description="Sign in to access your prescriptions, compare medication prices, and find the best pharmacy deals near you."
        heroImageSrc="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=2160&q=80"
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <span className="text-sm font-medium text-(--text-primary)">Signing in...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
