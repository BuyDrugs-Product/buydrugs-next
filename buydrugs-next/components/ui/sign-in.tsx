import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Avatar } from '@/components/Avatar';

// --- TYPES ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export interface SignInPageProps {
  title?: React.ReactNode;
  description?: string;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
      fill="#EA4335"
    />
  </svg>
);

// --- TESTIMONIAL CARD ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _TestimonialCard: React.FC<{ testimonial: Testimonial; index: number }> = ({ testimonial, index }) => (
  <div
    className="animate-element space-y-3 rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-[0_20px_60px_rgba(15,15,40,0.25)] backdrop-blur-lg"
    style={{ animationDelay: `${600 + index * 120}ms` }}
  >
    <div className="flex items-center gap-3">
      <Avatar src={testimonial.avatarSrc} alt={testimonial.name} size="md" className="ring-0" />
      <div className="flex-1 text-sm">
        <p className="font-semibold">{testimonial.name}</p>
        <p className="text-white/70">{testimonial.handle}</p>
      </div>
    </div>
    <p className="text-sm text-white/90">{testimonial.text}</p>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light tracking-tighter">Welcome</span>,
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const resolvedTestimonials =
    testimonials.length > 0
      ? testimonials
      : [
        {
          avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
          name: "Sarah Chen",
          handle: "@sarahdigital",
          text: "Amazing platform! The user experience is seamless and the features are exactly what I needed.",
        },
      ];
  const primaryVoice = resolvedTestimonials[0];
  const testimonialQuote =
    primaryVoice.text.length > 150 ? `${primaryVoice.text.slice(0, 147)}…` : primaryVoice.text;

  const narrativeSlides = [
    {
      badge: "Real-time coverage",
      heading: "Know which pharmacy has stock before you go",
      body: "Tap into 2,400+ verified pharmacies updating availability every few minutes so you can reserve confidently.",
      statValue: "2,400+",
      statLabel: "verified pharmacies",
    },
    {
      badge: "Smart savings",
      heading: "Price drops are tracked for you",
      body: "Our price intelligence watches 18k medications and nudges you when a cheaper alternative is in range.",
      statValue: "35%",
      statLabel: "avg. savings per order",
    },
    {
      badge: "Member story",
      heading: "Members stay loyal",
      body: `${primaryVoice.name} ${primaryVoice.handle}`,
      quoteText: testimonialQuote,
      quoteAttribution: `${primaryVoice.name} ${primaryVoice.handle}`,
    },
  ];

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!isClient) return;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % narrativeSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [isClient, narrativeSlides.length]);

  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden bg-(--surface-app) px-4 py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-lime-200 opacity-20 blur-3xl" />
        <div className="absolute right-[-10%] top-0 h-80 w-80 rounded-full bg-violet-600 opacity-20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-[-20%] mx-auto h-72 w-72 rounded-full bg-blue-500 opacity-10 blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl items-stretch gap-6 rounded-2xl bg-white/40 p-6 shadow-(--shadow-card) backdrop-blur-xl lg:grid-cols-2 lg:p-8">
        {/* Left column */}
        <section className="flex flex-col justify-between rounded-2xl bg-white/95 p-6 shadow-(--shadow-1) lg:p-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--surface-elevated) px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-(--text-secondary)">
              HIPAA Compliant
              <span className="h-1.5 w-1.5 rounded-full bg-(--action-primary)" />
            </span>
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-(--text-primary)">
                {title}
              </h1>
              <p className="text-base text-(--text-secondary)">{description}</p>
            </div>
          </div>

          <form className="mt-4 flex flex-col gap-4" onSubmit={onSignIn}>
            <TextField
              type="email"
              id="email"
              name="email"
              label="Email address"
              required
              placeholder="you@example.com"
              className="bg-white"
            />

            <div className="relative">
              <TextField
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                label="Password"
                required
                placeholder="Enter your password"
                className="pr-12 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-(--text-tertiary) hover:text-(--text-primary)"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label htmlFor="keep-signed-in" className="flex items-center gap-2 text-(--text-secondary)">
                <input
                  type="checkbox"
                  id="keep-signed-in"
                  name="keepSignedIn"
                  className="h-4 w-4 rounded border-(--border-subtle) text-(--action-primary) focus:ring-(--action-primary)"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={onResetPassword}
                className="font-medium text-(--action-primary) hover:text-(--action-primary-hover)"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" fullWidth size="lg" className="shadow-(--shadow-1)">
              Sign in
            </Button>

            <div className="relative py-1 text-center text-[10px] uppercase tracking-[0.4em] text-(--text-tertiary)">
              <span className="absolute inset-x-0 top-1/2 h-px bg-(--border-subtle)" />
              <span className="relative bg-white px-3">or continue with</span>
            </div>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="lg"
              icon={<GoogleIcon />}
              onClick={onGoogleSignIn}
            >
              Continue with Google
            </Button>
          </form>

          <p className="pt-4 text-center text-sm text-(--text-tertiary)">
            New to BuyDrugs?{' '}
            <button
              type="button"
              onClick={onCreateAccount}
              className="font-semibold text-(--action-primary) hover:text-(--action-primary-hover)"
            >
              Create an account
            </button>
          </p>
        </section>

        {/* Right column */}
        {heroImageSrc && (
          <section className="hidden rounded-3xl bg-linear-to-b from-violet-700 via-violet-800 to-violet-950 p-px shadow-[0_30px_90px_rgba(60,40,120,0.35)] lg:flex">
            <div className="relative flex w-full flex-col justify-between rounded-[26px] bg-linear-to-b from-violet-700/80 via-violet-800/85 to-violet-950/95 p-8 text-white">
              <div
                className="pointer-events-none absolute inset-0 rounded-[26px] opacity-35"
                style={{ backgroundImage: `url(${heroImageSrc})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <div className="relative space-y-4">
                <p className="text-[11px] uppercase tracking-[0.4em] text-white/60">
                  {narrativeSlides[isClient ? currentSlide : 0].badge}
                </p>
                <h2 className="text-3xl font-semibold leading-snug">
                  {narrativeSlides[isClient ? currentSlide : 0].heading}
                </h2>
                <p className="text-white/85">{narrativeSlides[isClient ? currentSlide : 0].body}</p>
                {narrativeSlides[isClient ? currentSlide : 0].statValue && (
                  <div className="mt-5 inline-flex items-baseline gap-4 rounded-2xl border border-white/20 bg-white/10 px-6 py-4">
                    <span className="text-4xl font-semibold">{narrativeSlides[isClient ? currentSlide : 0].statValue}</span>
                    <span className="text-sm text-white/85">{narrativeSlides[isClient ? currentSlide : 0].statLabel}</span>
                  </div>
                )}
                {narrativeSlides[isClient ? currentSlide : 0].quoteText && (
                  <div className="mt-5 space-y-2 rounded-2xl border border-white/15 bg-white/10 p-5">
                    <p className="text-sm italic text-white/90">“{narrativeSlides[isClient ? currentSlide : 0].quoteText}”</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      {narrativeSlides[isClient ? currentSlide : 0].quoteAttribution}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative mt-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {narrativeSlides.map((slide, index) => (
                    <button
                      key={slide.badge + index}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition-all ${(isClient ? currentSlide : 0) === index ? "w-8 bg-white" : "w-2.5 bg-white/40"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-white/70">
                  {(isClient ? currentSlide : 0) + 1}/{narrativeSlides.length}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
