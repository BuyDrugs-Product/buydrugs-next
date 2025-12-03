# Authentication Setup Guide

This document describes the Supabase authentication implementation in the BuyDrugs application.

## Overview

The application uses Supabase for authentication with email/password and OAuth (Google) support. The implementation follows Next.js 16 App Router conventions with Server Actions and proper SSR handling.

## Architecture

### File Structure

```
lib/supabase/
├── client.ts       # Browser client for Client Components
├── server.ts       # Server client for Server Components/Actions
└── middleware.ts   # Middleware client for session management

actions/
└── auth.ts         # Server Actions for all auth operations

app/
├── sign-in/        # Production sign-in page
├── sign-up/        # Sign-up page
├── forgot-password/# Password reset request page
└── auth/
    ├── callback/   # OAuth and email confirmation callback
    ├── reset-password/  # Password update page
    └── auth-code-error/ # Error page for failed auth

hooks/
└── useUser.ts      # Client-side user state hook

middleware.ts       # Root middleware for session refresh
```

## Key Features

### 1. Email Authentication

**Sign In**: `/sign-in`
- Email and password authentication
- Error handling with user-friendly messages
- "Keep me signed in" checkbox
- Loading states

**Sign Up**: `/sign-up`
- Account creation with email verification
- Full name metadata
- Password confirmation
- Email confirmation flow

**Forgot Password**: `/forgot-password`
- Password reset email request
- Success confirmation screen
- Link to return to sign-in

**Reset Password**: `/auth/reset-password`
- Password update form (accessed via email link)
- Password confirmation
- Success state with auto-redirect

### 2. OAuth Authentication

Currently configured for Google OAuth (not yet active in Supabase):
- Configured in sign-in and sign-up pages
- Uses `signInWithOAuth('google')` server action
- Redirects through `/auth/callback`

To enable:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Configure OAuth credentials
4. Set redirect URL: `http://localhost:3000/auth/callback`

### 3. Session Management

**Middleware** (`middleware.ts`):
- Runs on all routes (except static assets)
- Refreshes user session on each request
- Protects routes (optional - currently minimal protection)
- Handles cookie management

**Client Hook** (`useUser.ts`):
- Provides `user`, `loading`, `isAuthenticated`
- Subscribes to auth state changes
- Auto-updates on sign in/out

**Header Component**:
- Shows "Sign In / Get Started" when logged out
- Shows user email and dropdown menu when logged in
- Sign out button in menu
- Mobile responsive

### 4. Server Actions

All authentication operations use Server Actions (`actions/auth.ts`):

- `signInWithEmail(email, password)` - Sign in
- `signUpWithEmail(email, password, metadata)` - Create account
- `signOut()` - Sign out current user
- `resetPassword(email)` - Send password reset email
- `updatePassword(newPassword)` - Update password
- `signInWithOAuth(provider)` - OAuth sign in
- `getCurrentUser()` - Get current user (server-side)
- `isAuthenticated()` - Check auth status (server-side)

## Environment Variables

Required in `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Site URL for redirects (defaults to localhost:3000)
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

## Usage Examples

### Protecting a Page (Server Component)

```typescript
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <div>Hello {user.email}</div>;
}
```

### Using Auth in Client Component

```typescript
'use client';

import { useUser } from '@/hooks/useUser';
import { signOut } from '@/actions/auth';

export default function MyComponent() {
  const { user, loading, isAuthenticated } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please sign in</div>;

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Custom Sign-In Form

```typescript
'use client';

import { signInWithEmail } from '@/actions/auth';

export default function CustomSignIn() {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const email = form.get('email') as string;
    const password = form.get('password') as string;

    const result = await signInWithEmail(email, password);
    // result.success will be true, or result.error will contain error message
    // On success, user is automatically redirected to '/'
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Security Considerations

1. **Anon Key is Public**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose in the browser. It's protected by Row Level Security (RLS) policies in Supabase.

2. **Service Role Key is Private**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Keep it server-side only.

3. **HTTPS in Production**: Always use HTTPS in production for secure cookie transmission.

4. **RLS Policies**: Ensure Row Level Security policies are configured in Supabase for all tables that store user data.

5. **Password Requirements**: Supabase enforces minimum 6 character passwords by default. Additional validation is done client-side.

## Testing Checklist

- [x] Sign up with new email
- [x] Receive confirmation email
- [x] Confirm email and redirect
- [x] Sign in with email/password
- [x] See authenticated header state
- [x] Sign out successfully
- [x] Request password reset
- [x] Receive reset email
- [x] Update password via reset link
- [x] Sign in with new password
- [ ] OAuth with Google (pending Supabase setup)

## Troubleshooting

### "Invalid login credentials"
- Check that the user has confirmed their email
- Verify password is correct
- Check Supabase Auth logs in dashboard

### Email not sending
- Verify SMTP settings in Supabase Dashboard → Project Settings → Auth
- Check email templates are enabled
- Ensure email domain is verified (production)

### Session not persisting
- Check that middleware is running (should see in Network tab)
- Verify cookies are being set (check DevTools → Application → Cookies)
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### OAuth redirect loop
- Verify redirect URL is configured in Supabase OAuth provider settings
- Check that `/auth/callback` route handler is working
- Ensure OAuth credentials (Client ID/Secret) are correct

## Next Steps

1. **Enable OAuth Providers**: Configure Google OAuth in Supabase dashboard
2. **Add User Profiles**: Create a `profiles` table to store additional user data
3. **Implement Protected Routes**: Add more sophisticated route protection in middleware
4. **Email Templates**: Customize Supabase email templates for branding
5. **Session Duration**: Configure session timeout in Supabase settings
6. **Multi-Factor Auth**: Enable MFA in Supabase for enhanced security

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 16 App Router](https://nextjs.org/docs/app)
