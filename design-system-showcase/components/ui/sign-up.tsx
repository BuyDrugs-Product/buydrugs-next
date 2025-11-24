'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  FileBadge2,
  Globe,
  Info,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Store,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { SelectField } from '@/components/SelectField';
import { TextAreaField } from '@/components/TextAreaField';
import { Checkbox } from '@/components/Checkbox';
import { Chip } from '@/components/Chip';
import { PhoneInputField } from '@/components/PhoneInputField';
import { GooglePlacesAutocomplete } from '@/components/GooglePlacesAutocomplete';

export type RoleValue = 'customer' | 'pharmacy_admin' | 'pharmacy_staff';

export interface RoleOption {
  value: RoleValue;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface ProviderAdminProfile {
  pharmacyName: string;
  businessEmail: string;
  pharmacyAddress: string;
  pharmacyLatitude?: number;
  pharmacyLongitude?: number;
  website?: string;
  licenseNumber: string;
  licenseIssuer: string;
  licenseDocumentName?: string;
  staffInvites: string[];
}

export interface ProviderStaffProfile {
  pharmacyCode: string;
  pharmacyLocation?: string;
  employmentEmail: string;
  managerName: string;
  startDate: string;
}

export type ProviderProfilePayload =
  | { type: 'pharmacy_admin'; data: ProviderAdminProfile }
  | { type: 'pharmacy_staff'; data: ProviderStaffProfile };

export interface SignUpFormPayload {
  role: RoleValue;
  account: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phone: string;
  };
  profile: {
    dateOfBirth: string;
    gender: string;
    healthConsiderations: string[];
    currentPrescriptions: string[];
    extraNotes?: string;
    profilePhotoName?: string;
    shareHealthProfile: boolean;
  };
  consents: {
    savingsAlerts: boolean;
    refillReminders: boolean;
  };
  providerProfile?: ProviderProfilePayload;
}

interface SignUpExperienceProps {
  onSubmit?: (payload: SignUpFormPayload) => Promise<void> | void;
  onGoogleSignIn?: (role: RoleValue) => Promise<void> | void;
  isSubmitting?: boolean;
  error?: string | null;
  successRole?: RoleValue | null;
  initialRole?: RoleValue;
  roleLocked?: boolean;
  onReset?: () => void;
  initialData?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  isOAuthCompletion?: boolean; // When true, hides password fields
  initialStep?: 'role' | 'profile' | 'health' | 'provider';
  onRoleChange?: (role: RoleValue) => void;
}

const roleOptions: RoleOption[] = [
  {
    value: 'customer',
    title: 'I need prescriptions',
    description: 'Find the best prices for your medicines',
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    value: 'pharmacy_admin',
    title: 'I manage a pharmacy',
    description: 'Connect with customers and grow your business',
    icon: <Store className="h-5 w-5" />,
  },
  {
    value: 'pharmacy_staff',
    title: 'I work at a pharmacy',
    description: 'Manage prescriptions and serve customers',
    icon: <Users className="h-5 w-5" />,
  },
];

type SignupStepId = 'role' | 'profile' | 'health' | 'provider';

interface StepDefinition {
  id: SignupStepId;
  title: string;
  description: string;
}

interface StepProgressIndicatorProps {
  steps: StepDefinition[];
  activeStep: SignupStepId;
  completedSteps: Set<SignupStepId>;
  onSelect: (id: SignupStepId) => void;
}

const genderOptions = [
  { value: '', label: 'Select' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const stepCopy: Record<
  SignupStepId,
  { title: string; description: string }
> = {
  role: {
    title: 'Choose how you’ll use BuyDrugs',
    description: 'Tell us if you’re a customer looking for savings or a pharmacy partner.',
  },
  profile: {
    title: 'Share your contact & login details',
    description: 'Set up your account so pharmacies know how to reach you.',
  },
  health: {
    title: 'Build your health profile',
    description: 'Highlight what matters so we can personalize your experience.',
  },
  provider: {
    title: 'Add your pharmacy credentials',
    description: 'Share business info so we can verify and connect you with customers.',
  },
};

const adminStepMeta = [
  { title: 'Pharmacy Business Details', description: 'Tell customers who you are' },
  { title: 'Professional Verification', description: 'Upload your license for trust' },
  { title: 'Team Setup', description: 'Invite staff to keep refills moving' },
];

const staffStepMeta = [
  { title: 'Connect to Your Pharmacy', description: 'Link to the store you support' },
  { title: 'Employment Details', description: 'Share who we can verify with' },
];

const successMessaging: Record<RoleValue, { heading: string; body: string; subcopy: string }> = {
  customer: {
    heading: 'Welcome! Start finding better prices on your prescriptions',
    body: 'You now have a space built around your health choices. Compare pharmacies, unlock quick refills, and keep your care moving — all from one dashboard.',
    subcopy: 'Head to your inbox to confirm your email, then explore the best savings for your medicines.',
  },
  pharmacy_admin: {
    heading: "Your pharmacy account is being verified",
    body: "We're reviewing your documents so you can start serving customers and boosting loyalty. Expect an update within 1 business day.",
    subcopy: 'While you wait, invite your staff so they can jump in once verification wraps.',
  },
  pharmacy_staff: {
    heading: "You're almost ready to help customers",
    body: "We’re syncing with your pharmacy lead to approve your access. Expect a confirmation shortly so you can support quick refills and better savings.",
    subcopy: 'Keep an eye on your inbox for next steps. You can always return to update your details.',
  },
};

export const SignUpExperience: React.FC<SignUpExperienceProps> = ({
  onSubmit,
  onGoogleSignIn,
  isSubmitting,
  error,
  successRole,
  initialRole = 'customer',
  roleLocked = false,
  onReset,
  initialData,
  isOAuthCompletion = false,
  initialStep,
  onRoleChange,
}) => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleValue>(initialRole);
  const [localError, setLocalError] = useState<string | null>(null);
  const [account, setAccount] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
    phone: initialData?.phone || '',
  });
  const [profile, setProfile] = useState({
    dateOfBirth: '',
    gender: '',
    healthConsiderations: [] as string[],
    currentPrescriptions: [] as string[],
    extraNotes: '',
    profilePhotoName: undefined as string | undefined,
    shareHealthProfile: false,
  });
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [healthDetailsOpen, setHealthDetailsOpen] = useState(false);
  const [consents, setConsents] = useState({
    savingsAlerts: true,
    refillReminders: true,
  });
  const [adminProfile, setAdminProfile] = useState<ProviderAdminProfile>({
    pharmacyName: '',
    businessEmail: '',
    pharmacyAddress: '',
    website: '',
    licenseNumber: '',
    licenseIssuer: '',
    licenseDocumentName: undefined,
    staffInvites: [''],
  });
  const [staffProfile, setStaffProfile] = useState<ProviderStaffProfile>({
    pharmacyCode: '',
    pharmacyLocation: '',
    employmentEmail: '',
    managerName: '',
    startDate: '',
  });
  const [activeStep, setActiveStep] = useState<SignupStepId>(initialStep || (roleLocked ? 'profile' : 'role'));
  const [completedSteps, setCompletedSteps] = useState<Set<SignupStepId>>(() => new Set());

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Notify parent when role changes
  useEffect(() => {
    if (onRoleChange) {
      onRoleChange(selectedRole);
    }
  }, [selectedRole, onRoleChange]);

  const isProvider = selectedRole !== 'customer';
  const stepDefinitions = useMemo<StepDefinition[]>(() => {
    const steps: StepDefinition[] = [
      { id: 'role', ...stepCopy.role },
      { id: 'profile', ...stepCopy.profile },
      { id: 'health', ...stepCopy.health },
    ];
    if (isProvider) {
      steps.push({ id: 'provider', ...stepCopy.provider });
    }
    return steps;
  }, [isProvider]);
  const getStepIndex = (id: SignupStepId) =>
    stepDefinitions.findIndex((step) => step.id === id);

  useEffect(() => {
    if (stepDefinitions.length === 0) {
      return;
    }
    if (!stepDefinitions.some((step) => step.id === activeStep)) {
      setActiveStep(stepDefinitions[0].id);
    }
    setCompletedSteps((prev) => {
      const allowed = new Set(stepDefinitions.map((step) => step.id));
      let changed = false;
      const next = new Set<SignupStepId>();
      prev.forEach((id) => {
        if (allowed.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [stepDefinitions, activeStep]);

  const goToStep = (id: SignupStepId) => {
    setActiveStep(id);
  };

  const goToNextStep = (current: SignupStepId) => {
    setCompletedSteps((prev) => {
      if (prev.has(current)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(current);
      return next;
    });
    const currentIndex = getStepIndex(current);
    if (currentIndex >= 0 && currentIndex < stepDefinitions.length - 1) {
      setActiveStep(stepDefinitions[currentIndex + 1].id);
    }
  };

  const goToPreviousStep = (current: SignupStepId) => {
    const currentIndex = getStepIndex(current);
    if (currentIndex > 0) {
      setActiveStep(stepDefinitions[currentIndex - 1].id);
    }
  };

  useEffect(() => {
    if (!profile.profilePhotoName) {
      setProfilePhotoPreview(null);
    }
  }, [profile.profilePhotoName]);

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfile((prev) => ({ ...prev, profilePhotoName: file.name }));
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAdminProfile((prev) => ({ ...prev, licenseDocumentName: file.name }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!account.fullName.trim()) {
      setLocalError('Please share your full name so pharmacies know who to help.');
      return;
    }

    // Skip password validation for OAuth users
    if (!isOAuthCompletion) {
      if (account.password.length < 6) {
        setLocalError('Use at least 6 characters for your password.');
        return;
      }

      if (account.password !== account.confirmPassword) {
        setLocalError('Passwords need to match to keep your account secure.');
        return;
      }
    }

    if (!profile.dateOfBirth) {
      setLocalError('Sharing your birthday helps us personalize your experience.');
      return;
    }

    if (isProvider && selectedRole === 'pharmacy_admin' && !adminProfile.licenseNumber) {
      setLocalError('Enter your pharmacy license to start verification.');
      return;
    }

    if (isProvider && selectedRole === 'pharmacy_staff' && !staffProfile.pharmacyCode) {
      setLocalError('Connect to your pharmacy so we can notify the right admin.');
      return;
    }

    const payload: SignUpFormPayload = {
      role: selectedRole,
      account,
      profile,
      consents,
      providerProfile: isProvider
        ? selectedRole === 'pharmacy_admin'
          ? { type: 'pharmacy_admin', data: adminProfile }
          : { type: 'pharmacy_staff', data: staffProfile }
        : undefined,
    };

    await onSubmit?.(payload);
  };

  if (successRole) {
    const message = successMessaging[successRole];
    return (
      <div className="relative min-h-[calc(100dvh-4rem)] bg-(--surface-app) px-4 py-12">
        <BackgroundGlow />
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="glass space-y-8 rounded-3xl p-8 text-center shadow-(--shadow-card) md:p-12">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-(--shadow-1) ring-4 ring-emerald-100/50">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-(--text-tertiary)">
                Account created
              </p>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-(--text-primary)">
                {message.heading}
              </h1>
              <div className="mx-auto max-w-lg space-y-2">
                <p className="text-lg leading-relaxed text-(--text-secondary)">{message.body}</p>
                <p className="text-sm font-medium text-(--text-tertiary)">{message.subcopy}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 pt-8 border-t border-(--border-subtle)">
              <Button
                size="lg"
                fullWidth
                className="h-12 text-base shadow-(--shadow-2)"
                icon={<ArrowRight className="h-5 w-5" />}
                onClick={() => router.push('/sign-in')}
              >
                Go to sign in
              </Button>
              <button
                type="button"
                onClick={onReset}
                className="text-sm font-semibold text-(--text-secondary) hover:text-(--text-primary) transition-colors py-2"
              >
                Create another account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-(--surface-app) px-4 py-10 md:px-8">
      <BackgroundGlow />
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <div className="glass space-y-8 rounded-[2rem] p-6 shadow-(--shadow-card) md:p-10">
          <header className="mb-8 space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-lime-700 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
              Customer-first
            </p>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-(--text-primary) md:text-5xl">
                Create your profile
              </h1>
              <p className="text-lg text-(--text-secondary) md:text-xl">
                Get your prescriptions faster, find savings with confidence, and keep every refill organized.
              </p>
            </div>
          </header>

          <StepProgressIndicator
            steps={stepDefinitions}
            activeStep={activeStep}
            completedSteps={completedSteps}
            onSelect={goToStep}
          />

          {(localError || error) && (
            <div className="rounded-xl border border-red-100 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-sm">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            {activeStep === 'role' && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700" aria-labelledby="role-section-heading">
                <div className="space-y-1">
                  <h2 id="role-section-heading" className="text-2xl font-semibold text-(--text-primary)">
                    Choose how you use BuyDrugs
                  </h2>
                  <p className="text-base text-(--text-secondary)">We personalize wording and tools for you.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {roleOptions.map((option) => (
                    <RoleSelectionCard
                      key={option.value}
                      option={option}
                      selected={selectedRole === option.value}
                      onSelect={() => {
                        if (!roleLocked) {
                          setSelectedRole(option.value);
                        }
                      }}
                      disabled={roleLocked && option.value !== selectedRole}
                    />
                  ))}
                </div>
                <div className="flex justify-end pt-6">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => goToNextStep('role')}
                    className="min-w-[160px] text-base"
                  >
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </section>
            )}

            {activeStep === 'profile' && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" aria-labelledby="profile-section-heading">
                <div className="space-y-1">
                  <h2 id="profile-section-heading" className="text-2xl font-semibold text-(--text-primary)">
                    Tell us about yourself
                  </h2>
                  <p className="text-base text-(--text-secondary)">This helps us find the right prescriptions faster.</p>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    size="lg"
                    onClick={() => onGoogleSignIn?.(selectedRole)}
                    className="bg-white hover:bg-gray-50 text-(--text-primary) border border-(--border-subtle) shadow-(--shadow-1)"
                    icon={
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                        <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                        <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                      </svg>
                    }
                  >
                    Continue with Google
                  </Button>

                  <div className="relative py-2 text-center text-[10px] uppercase tracking-[0.4em] text-(--text-tertiary)">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-(--border-subtle)" />
                    <span className="relative bg-(--surface-app) px-3">or fill in manually</span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <TextField
                    label="Full name"
                    placeholder="Jordan Rivers"
                    required
                    value={account.fullName}
                    onChange={(event) => setAccount((prev) => ({ ...prev, fullName: event.target.value }))}
                    helperText="This is how pharmacists will greet you."
                  />
                  <PhoneInputField
                    label="Phone number"
                    required
                    value={account.phone}
                    onChange={(value) => setAccount((prev) => ({ ...prev, phone: value || '' }))}
                    helperText="For refill reminders and delivery updates."
                  />
                  <TextField
                    type="email"
                    label="Email address"
                    placeholder="you@example.com"
                    required
                    value={account.email}
                    onChange={(event) => setAccount((prev) => ({ ...prev, email: event.target.value }))}
                    helperText="We use this to send confirmations and savings finds."
                  />
                  {!isOAuthCompletion && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextField
                        type="password"
                        label="Password"
                        placeholder="At least 6 characters"
                        required
                        value={account.password}
                        onChange={(event) => setAccount((prev) => ({ ...prev, password: event.target.value }))}
                      />
                      <TextField
                        type="password"
                        label="Confirm password"
                        placeholder="Repeat password"
                        required
                        value={account.confirmPassword}
                        onChange={(event) => setAccount((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <TextField
                    type="date"
                    label="Date of birth"
                    required
                    value={profile.dateOfBirth}
                    onChange={(event) => setProfile((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
                    helperText="For personalized service."
                    leadingIcon={<Calendar className="h-4 w-4" />}
                  />
                  <SelectField
                    label="Gender"
                    options={genderOptions}
                    value={profile.gender}
                    onChange={(event) => setProfile((prev) => ({ ...prev, gender: event.target.value }))}
                    helperText="Helps us tailor search results if needed."
                  />
                </div>

                <div className="flex justify-between pt-8 border-t border-(--border-subtle)">
                  <Button type="button" variant="ghost" onClick={() => goToPreviousStep('profile')}>
                    Back
                  </Button>
                  <Button type="button" size="lg" onClick={() => goToNextStep('profile')} className="min-w-[160px] text-base">
                    Continue
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </section>
            )}

            {activeStep === 'health' && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700" aria-labelledby="health-section-heading">
                <div className="space-y-1">
                  <h2 id="health-section-heading" className="text-2xl font-semibold text-(--text-primary)">
                    Your health profile
                  </h2>
                  <p className="text-base text-(--text-secondary)">Share what matters — we respect your privacy.</p>
                </div>

                <div className="space-y-6 rounded-2xl border border-(--border-subtle) bg-white/50 p-6">
                  <TagInput
                    label="Health considerations"
                    placeholder="Add an allergy or note (Enter to add)"
                    helperText="Any allergies or health notes?"
                    values={profile.healthConsiderations}
                    onChange={(values) => setProfile((prev) => ({ ...prev, healthConsiderations: values }))}
                  />
                  <TagInput
                    label="Medicines you're currently taking"
                    placeholder="Add a medicine and press Enter"
                    helperText="We use this to ensure your prescriptions are appropriate."
                    values={profile.currentPrescriptions}
                    onChange={(values) => setProfile((prev) => ({ ...prev, currentPrescriptions: values }))}
                  />
                  <TextAreaField
                    label="Anything else you'd like us to know?"
                    minRows={3}
                    placeholder="Share health goals, refill habits, or preferred pharmacies."
                    value={profile.extraNotes}
                    onChange={(event) => setProfile((prev) => ({ ...prev, extraNotes: event.target.value }))}
                    helperText="Your information is secure and private."
                  />
                  <Checkbox
                    checked={profile.shareHealthProfile ?? true}
                    defaultChecked={true}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, shareHealthProfile: event.target.checked }))
                    }
                    label="I’m comfortable sharing this info with pharmacies I connect to for care."
                    description="You stay in control of what gets shared."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-(--text-primary)">Profile photo (optional)</p>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-(--border-default) bg-white/30 px-4 py-8 text-center text-sm text-(--text-secondary) transition-colors hover:bg-white/60 hover:border-(--action-primary)">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          className="mb-3 h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                        />
                      ) : (
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-(--surface-muted) text-(--text-tertiary)">
                          <Upload className="h-8 w-8" />
                        </div>
                      )}
                      <span className="font-semibold text-(--action-primary)">Upload a friendly photo</span>
                      <span className="mt-1 text-xs text-(--text-tertiary)">Helps pharmacy teams recognize you</span>
                      <input type="file" accept="image/*" className="sr-only" onChange={handleProfilePhotoChange} />
                    </label>
                  </div>
                  <div className="space-y-4 rounded-2xl border border-dashed border-(--border-subtle) bg-white/30 p-6">
                    <p className="text-sm font-semibold text-(--text-primary)">Stay in the know</p>
                    <div className="space-y-4">
                      <Checkbox
                        label="Get savings alerts"
                        description="Find better prices before you refill."
                        checked={consents.savingsAlerts}
                        onChange={(event) => setConsents((prev) => ({ ...prev, savingsAlerts: event.target.checked }))}
                      />
                      <Checkbox
                        label="Receive quick refill reminders"
                        description="We nudge you before you run out."
                        checked={consents.refillReminders}
                        onChange={(event) => setConsents((prev) => ({ ...prev, refillReminders: event.target.checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8 border-t border-(--border-subtle)">
                  <Button type="button" variant="ghost" onClick={() => goToPreviousStep('health')}>
                    Back
                  </Button>
                  {isProvider ? (
                    <Button type="button" size="lg" onClick={() => goToNextStep('health')} className="min-w-[160px] text-base">
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      className="min-w-[200px] text-base shadow-(--shadow-2)"
                      disabled={Boolean(isSubmitting)}
                    >
                      {isSubmitting ? 'Creating account...' : 'Create my account'}
                    </Button>
                  )}
                </div>
              </section>
            )}

            {activeStep === 'provider' && isProvider && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ProviderVerificationFlow
                  role={selectedRole}
                  adminProfile={adminProfile}
                  onAdminChange={setAdminProfile}
                  staffProfile={staffProfile}
                  onStaffChange={setStaffProfile}
                  onLicenseUpload={handleLicenseUpload}
                />
                <div className="flex justify-between pt-8 border-t border-(--border-subtle)">
                  <Button type="button" variant="ghost" onClick={() => goToPreviousStep('provider')}>
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="min-w-[200px] text-base shadow-(--shadow-2)"
                    disabled={Boolean(isSubmitting)}
                  >
                    {isSubmitting ? 'Verifying...' : 'Submit for verification'}
                  </Button>
                </div>
              </section>
            )}
          </form>

          <p className="text-center text-sm text-(--text-tertiary)">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-semibold text-(--action-primary) hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-6">
            <div className="glass space-y-6 rounded-[2rem] p-8 shadow-(--shadow-card)">
              <p className="text-lg font-bold text-(--text-primary)">Why customers choose BuyDrugs</p>
              <div className="space-y-5">
                <BenefitHighlight
                  icon={<SparklesIcon />}
                  title="Find savings"
                  description="Price drops are tracked for you so you never miss a better offer."
                />
                <BenefitHighlight
                  icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
                  title="Quick refills"
                  description="Reserve medicines in the app before you step into the pharmacy."
                />
                <BenefitHighlight
                  icon={<TargetIcon />}
                  title="Health choices"
                  description="See which pharmacies cover all your prescriptions in one trip."
                />
              </div>
            </div>
            <div className="glass rounded-[2rem] p-8 shadow-(--shadow-1) space-y-3 text-sm text-(--text-secondary)">
              <p className="text-base font-bold text-(--text-primary)">Need help?</p>
              <p>Live care guides are available 7 days a week to walk you through setup.</p>
              <Link href="/design-system/sign-in-demo" className="inline-flex items-center gap-2 font-semibold text-(--action-primary) hover:underline">
                See our experience
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const RoleSelectionCard: React.FC<{
  option: RoleOption;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}> = ({ option, selected, onSelect, disabled }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition-all duration-300',
        selected
          ? 'border-(--action-primary) bg-white shadow-(--shadow-2) ring-1 ring-(--action-primary)'
          : 'border-transparent bg-white/60 hover:border-(--border-strong) hover:bg-white hover:shadow-(--shadow-1)',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <div className="flex items-start justify-between w-full">
        <span
          className={cn(
            'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300',
            selected
              ? 'bg-(--action-primary) text-white'
              : 'bg-(--surface-muted) text-(--text-tertiary) group-hover:bg-(--surface-app-strong) group-hover:text-(--text-primary)'
          )}
        >
          {option.icon}
        </span>
        {selected && (
          <CheckCircle2 className="h-5 w-5 text-(--action-primary) animate-in fade-in zoom-in duration-300" />
        )}
      </div>
      <div>
        <p className={cn("font-semibold transition-colors", selected ? "text-(--action-primary)" : "text-(--text-primary)")}>
          {option.title}
        </p>
        <p className="text-sm text-(--text-secondary) mt-1 leading-relaxed">
          {option.description}
        </p>
      </div>
    </button>
  );
};

const TagInput: React.FC<{
  label: string;
  helperText?: string;
  placeholder?: string;
  values: string[];
  onChange: (next: string[]) => void;
}> = ({ label, helperText, placeholder, values, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    const cleaned = inputValue.trim();
    if (cleaned && !values.includes(cleaned)) {
      onChange([...values, cleaned]);
    }
    setInputValue('');
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((value) => value !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-(--text-primary)">{label}</label>
      <div className="min-h-[56px] rounded-[var(--radius-sm)] border border-(--border-default) bg-(--surface-elevated) px-3 py-2 text-sm text-(--text-primary) shadow-(--shadow-1) focus-within:border-(--border-focus) focus-within:ring-4 focus-within:ring-[rgba(89,71,255,0.18)]">
        <div className="flex flex-wrap items-center gap-2">
          {values.map((value) => (
            <Chip
              key={value}
              label={value}
              variant="tag"
              size="sm"
              trailingIcon={<X className="h-3 w-3" />}
              className="cursor-pointer"
              onClick={() => removeTag(value)}
            />
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addTag();
              } else if (event.key === 'Backspace' && !inputValue && values.length) {
                removeTag(values[values.length - 1]);
              }
            }}
            onBlur={() => {
              if (inputValue.trim()) {
                addTag();
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-(--text-primary) placeholder:text-(--text-tertiary) focus:outline-none"
          />
        </div>
      </div>
      {helperText && <p className="text-xs text-(--text-secondary)">{helperText}</p>}
    </div>
  );
};

interface ProviderVerificationFlowProps {
  role: RoleValue;
  adminProfile: ProviderAdminProfile;
  onAdminChange: React.Dispatch<React.SetStateAction<ProviderAdminProfile>>;
  staffProfile: ProviderStaffProfile;
  onStaffChange: React.Dispatch<React.SetStateAction<ProviderStaffProfile>>;
  onLicenseUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProviderVerificationFlow: React.FC<ProviderVerificationFlowProps> = ({
  role,
  adminProfile,
  onAdminChange,
  staffProfile,
  onStaffChange,
  onLicenseUpload,
}) => {
  const isAdmin = role === 'pharmacy_admin';

  if (role === 'customer') {
    return null;
  }

  return (
    <section className="space-y-5" aria-labelledby="provider-section-heading">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 id="provider-section-heading" className="text-xl font-semibold text-(--text-primary)">
            Step 4 · Provider verification
          </h2>
          <p className="text-sm text-(--text-secondary)">
            Help us confirm your pharmacy role so you can serve customers soon.
          </p>
        </div>
        <InfoTooltip message="We keep your pharmacy credentials safe and only share them with our verification team." />
      </div>

      {isAdmin ? (
        <div className="space-y-4">
          <ProviderStepCard
            step={1}
            title={adminStepMeta[0].title}
            description={adminStepMeta[0].description}
            icon={<Store className="h-4 w-4" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Pharmacy name"
                placeholder="Sunrise Wellness Pharmacy"
                value={adminProfile.pharmacyName}
                onChange={(event) => onAdminChange((prev) => ({ ...prev, pharmacyName: event.target.value }))}
              />
              <TextField
                label="Business email"
                type="email"
                placeholder="owner@sunrisewellness.com"
                value={adminProfile.businessEmail}
                onChange={(event) => onAdminChange((prev) => ({ ...prev, businessEmail: event.target.value }))}
              />
              <GooglePlacesAutocomplete
                label="Pharmacy location"
                placeholder="Start typing your pharmacy address..."
                value={adminProfile.pharmacyAddress}
                onChange={(address, placeDetails) => {
                  onAdminChange((prev) => ({
                    ...prev,
                    pharmacyAddress: address,
                    pharmacyLatitude: placeDetails?.latitude,
                    pharmacyLongitude: placeDetails?.longitude,
                  }));
                }}
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || ''}
              />
              <TextField
                label="Website (optional)"
                placeholder="https://yourpharmacy.com"
                value={adminProfile.website}
                onChange={(event) => onAdminChange((prev) => ({ ...prev, website: event.target.value }))}
                leadingIcon={<Globe className="h-4 w-4" />}
              />
            </div>
          </ProviderStepCard>

          <ProviderStepCard
            step={2}
            title={adminStepMeta[1].title}
            description={adminStepMeta[1].description}
            icon={<ShieldCheck className="h-4 w-4" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="License number"
                placeholder="AB-123456"
                value={adminProfile.licenseNumber}
                onChange={(event) => onAdminChange((prev) => ({ ...prev, licenseNumber: event.target.value }))}
              />
              <TextField
                label="Issuing authority"
                placeholder="State Pharmacy Board"
                value={adminProfile.licenseIssuer}
                onChange={(event) => onAdminChange((prev) => ({ ...prev, licenseIssuer: event.target.value }))}
              />
            </div>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-(--border-default) px-4 py-6 text-center text-sm text-(--text-secondary)">
              <Upload className="mb-2 h-6 w-6 text-(--text-tertiary)" />
              <span className="font-semibold text-(--action-primary)">
                {adminProfile.licenseDocumentName ?? 'Upload license document'}
              </span>
              <span className="text-xs text-(--text-tertiary)">PDF, PNG, or JPG</span>
              <input type="file" className="sr-only" onChange={onLicenseUpload} />
            </label>
          </ProviderStepCard>

          <ProviderStepCard
            step={3}
            title={adminStepMeta[2].title}
            description={adminStepMeta[2].description}
            icon={<Users className="h-4 w-4" />}
          >
            <p className="text-sm text-(--text-secondary)">
              Invite teammates so they can assist with prescriptions and customer care once you’re verified.
            </p>
            <div className="space-y-3">
              {adminProfile.staffInvites.map((email, index) => (
                <div key={`${email}-${index}`} className="flex gap-2">
                  <TextField
                    type="email"
                    placeholder="team@sunrisepharmacy.com"
                    value={email}
                    onChange={(event) => {
                      const next = [...adminProfile.staffInvites];
                      next[index] = event.target.value;
                      onAdminChange((prev) => ({ ...prev, staffInvites: next }));
                    }}
                    className="flex-1"
                  />
                  {adminProfile.staffInvites.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        onAdminChange((prev) => ({
                          ...prev,
                          staffInvites: prev.staffInvites.filter((_, idx) => idx !== index),
                        }));
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onAdminChange((prev) => ({ ...prev, staffInvites: [...prev.staffInvites, ''] }))
                }
                className="w-full"
              >
                Add another team member
              </Button>
            </div>
          </ProviderStepCard>
        </div>
      ) : (
        <div className="space-y-4">
          <ProviderStepCard
            step={1}
            title={staffStepMeta[0].title}
            description={staffStepMeta[0].description}
            icon={<Search className="h-4 w-4" />}
          >
            <TextField
              label="Pharmacy invite code or name"
              placeholder="Enter code from your admin"
              value={staffProfile.pharmacyCode}
              onChange={(event) => onStaffChange((prev) => ({ ...prev, pharmacyCode: event.target.value }))}
            />
            <TextField
              label="City or neighborhood"
              placeholder="Where do you serve customers?"
              value={staffProfile.pharmacyLocation}
              onChange={(event) => onStaffChange((prev) => ({ ...prev, pharmacyLocation: event.target.value }))}
              className="mt-3"
              leadingIcon={<Globe className="h-4 w-4" />}
            />
          </ProviderStepCard>

          <ProviderStepCard
            step={2}
            title={staffStepMeta[1].title}
            description={staffStepMeta[1].description}
            icon={<FileBadge2 className="h-4 w-4" />}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Employment email"
                type="email"
                placeholder="you@pharmacy.com"
                value={staffProfile.employmentEmail}
                onChange={(event) => onStaffChange((prev) => ({ ...prev, employmentEmail: event.target.value }))}
                leadingIcon={<Mail className="h-4 w-4" />}
              />
              <TextField
                label="Manager name"
                placeholder="Taylor Gomez"
                value={staffProfile.managerName}
                onChange={(event) => onStaffChange((prev) => ({ ...prev, managerName: event.target.value }))}
              />
              <TextField
                label="Start date"
                type="date"
                value={staffProfile.startDate}
                onChange={(event) => onStaffChange((prev) => ({ ...prev, startDate: event.target.value }))}
                leadingIcon={<Calendar className="h-4 w-4" />}
              />
            </div>
          </ProviderStepCard>
        </div>
      )}
    </section>
  );
};

const ProviderStepCard: React.FC<{
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, title, description, icon, children }) => {
  return (
    <Card surface="muted" elevation="none" className="space-y-4 border border-(--border-subtle)">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-(--surface-elevated) text-(--text-brand)">
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">Step {step}</p>
          <h3 className="text-lg font-semibold text-(--text-primary)">{title}</h3>
          <p className="text-sm text-(--text-secondary)">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
};

const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  steps,
  activeStep,
  completedSteps,
  onSelect,
}) => {
  if (!steps.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-(--text-tertiary)">
          Your sign-up path
        </span>
      </div>
      <ol className="flex w-full items-center gap-2">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = completedSteps.has(step.id);
          const isClickable = isCompleted || isActive;

          return (
            <li key={step.id} className="flex-1">
              <button
                type="button"
                onClick={() => isClickable && onSelect(step.id)}
                disabled={!isClickable}
                className={cn(
                  'group relative flex w-full flex-col gap-2 rounded-xl border p-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus)',
                  isActive
                    ? 'border-(--action-primary) bg-white shadow-(--shadow-1)'
                    : isCompleted
                      ? 'border-transparent bg-white/50 hover:bg-white/80'
                      : 'cursor-not-allowed border-transparent bg-white/20 opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider',
                      isActive ? 'text-(--action-primary)' : 'text-(--text-tertiary)'
                    )}
                  >
                    Step {index + 1}
                  </span>
                  {isCompleted && !isActive && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-(--text-success)" />
                  )}
                </div>
                <p
                  className={cn(
                    'text-sm font-medium leading-tight',
                    isActive ? 'text-(--text-primary)' : 'text-(--text-secondary)'
                  )}
                >
                  {step.title}
                </p>
                {isActive && (
                  <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-xl bg-(--surface-muted)">
                    <div className="h-full w-full animate-[slideRightIn_1s_ease-out] bg-(--action-primary)" />
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const BenefitHighlight: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="flex gap-3 rounded-xl border border-(--border-subtle) bg-white/70 p-3">
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-(--surface-muted)">
      {icon}
    </span>
    <div>
      <p className="font-semibold text-(--text-primary)">{title}</p>
      <p className="text-sm text-(--text-secondary)">{description}</p>
    </div>
  </div>
);

const InfoTooltip: React.FC<{ message: string }> = ({ message }) => (
  <span className="group relative inline-flex">
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border-subtle) bg-white text-(--text-secondary)">
      <Info className="h-4 w-4" />
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-56 -translate-x-1/2 rounded-xl border border-(--border-default) bg-[var(--surface-app-strong)] px-3 py-2 text-xs text-(--text-secondary) shadow-(--shadow-card) group-hover:block group-focus-within:block"
      >
        {message}
      </span>
    </span>
  </span>
);

const SparklesIcon = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center text-amber-500">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 1l1.2 3.8L13 6l-3.8 1.2L8 11 6.8 7.2 3 6l3.8-1.2z" />
    </svg>
  </span>
);

const TargetIcon = () => (
  <span className="inline-flex h-4 w-4 items-center justify-center text-indigo-500">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="11" />
    </svg>
  </span>
);

const BackgroundGlow = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -left-[10%] top-[-10%] h-[800px] w-[800px] rounded-full bg-radial from-lime-200/40 to-transparent blur-3xl" />
    <div className="absolute right-[-5%] top-[-10%] h-[600px] w-[600px] rounded-full bg-radial from-violet-200/40 to-transparent blur-3xl" />
    <div className="absolute bottom-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-radial from-blue-100/40 to-transparent blur-3xl" />
  </div>
);

export default SignUpExperience;

