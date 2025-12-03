# SignIn Component

A fully-featured sign-in page component with animations, testimonials, and Google authentication support.

## Location

- **Component**: `components/ui/sign-in.tsx`
- **Demo Page**: `app/design-system/sign-in-demo/page.tsx`

## Demo URL

After running `npm run dev`, visit:
```
http://localhost:3000/design-system/sign-in-demo
```

## Features

- ✨ Smooth fade-in animations on load
- 🔐 Password visibility toggle
- 🎨 Fully integrated with your design system
- 📱 Responsive layout (stacks on mobile, side-by-side on desktop)
- 🎭 Hero image with gradient overlay
- 💬 Customer testimonials display
- 🔍 Google Sign-In integration
- ♿ Accessible form controls

## Usage

### Basic Example

```tsx
import { SignInPage } from "@/components/ui/sign-in";

export default function MySignInPage() {
  return (
    <SignInPage
      title="Welcome Back"
      description="Sign in to your account"
      onSignIn={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        // Handle sign in
      }}
      onGoogleSignIn={() => {
        // Handle Google sign in
      }}
      onResetPassword={() => {
        // Navigate to password reset
      }}
      onCreateAccount={() => {
        // Navigate to sign up
      }}
    />
  );
}
```

### With Hero Image and Testimonials

```tsx
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless."
  },
  // ... more testimonials
];

export default function MySignInPage() {
  return (
    <SignInPage
      title={<span>Welcome to <span className="text-primary">BuyDrugs</span></span>}
      description="Sign in to access your prescriptions and compare prices."
      heroImageSrc="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=2160&q=80"
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}
```

## Props

### SignInPageProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `React.ReactNode` | `"Welcome"` | Title displayed at the top |
| `description` | `string` | `"Access your account..."` | Subtitle text |
| `heroImageSrc` | `string` | `undefined` | URL for the hero image (right side on desktop) |
| `testimonials` | `Testimonial[]` | `[]` | Array of customer testimonials |
| `onSignIn` | `(event: FormEvent) => void` | `undefined` | Form submit handler |
| `onGoogleSignIn` | `() => void` | `undefined` | Google sign-in button handler |
| `onResetPassword` | `() => void` | `undefined` | Forgot password link handler |
| `onCreateAccount` | `() => void` | `undefined` | Create account link handler |

### Testimonial Type

```typescript
interface Testimonial {
  avatarSrc: string;   // URL to user avatar image
  name: string;        // User's display name
  handle: string;      // User's handle (e.g., "@username")
  text: string;        // Testimonial content
}
```

## Styling

The component uses your existing design system variables:

- `--background` / `--foreground` - Base colors
- `--primary` / `--primary-foreground` - Primary action colors
- `--border` - Input borders
- `--muted` / `--muted-foreground` - Secondary text

These are defined in `app/globals.css` and mapped to your design tokens.

## Animations

The component includes staggered fade-in animations:

- Title: 100ms delay
- Description: 200ms delay
- Form: 300ms delay
- Divider: 400ms delay
- Google button: 500ms delay
- Create account: 600ms delay
- Testimonials: 700ms+ (150ms between each)

Animation keyframes are defined in `app/globals.css`:
- `fadeSlideIn` - Main animation
- `slideRightIn` - Horizontal slide
- `testimonialIn` - Testimonial cards

## Form Data Access

The `onSignIn` handler receives a form event. Access form data like this:

```tsx
const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Your authentication logic here
  console.log({ email, password });
};
```

## Customization

### Custom Title with Brand Color

```tsx
<SignInPage
  title={
    <span>
      Welcome to <span className="text-violet-600">YourBrand</span>
    </span>
  }
/>
```

### Without Hero Image

Simply omit the `heroImageSrc` prop and the right column won't render (full width form on all screen sizes).

### Custom Testimonials

Create your own testimonial data structure matching the `Testimonial` interface. Use real user photos or placeholder images from services like:
- `https://randomuser.me/api/portraits/`
- `https://i.pravatar.cc/`
- `https://ui-avatars.com/`

## Integration with Next.js App

### As a Route

Place the component in your app directory structure:

```
app/
  sign-in/
    page.tsx  <- Your SignInPage component
```

### With Server Actions

```tsx
"use client";

import { SignInPage } from "@/components/ui/sign-in";
import { signInAction } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function SignInRoute() {
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await signInAction(formData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <SignInPage
      onSignIn={handleSignIn}
      // ... other props
    />
  );
}
```

## Accessibility

The component includes:
- Proper form labels with `htmlFor` attributes
- ARIA labels for icon buttons
- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements

## Browser Support

Works in all modern browsers that support:
- CSS custom properties
- CSS Grid
- CSS animations
- ES2017+ JavaScript
