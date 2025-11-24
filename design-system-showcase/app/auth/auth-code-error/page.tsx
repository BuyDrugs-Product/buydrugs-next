import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--surface-app) px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/95 p-8 text-center shadow-(--shadow-card)">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-(--text-primary)">
            Authentication Error
          </h1>
          <p className="text-(--text-secondary)">
            Sorry, we could not authenticate your account. The link may have expired or is invalid.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/sign-in"
            className="inline-flex w-full items-center justify-center rounded-lg bg-(--action-primary) px-4 py-3 text-sm font-medium text-white hover:bg-(--action-primary-hover)"
          >
            Return to Sign In
          </Link>
          <p className="text-sm text-(--text-tertiary)">
            Need help?{' '}
            <a
              href="mailto:support@buydrugs.com"
              className="font-medium text-(--action-primary) hover:text-(--action-primary-hover)"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
