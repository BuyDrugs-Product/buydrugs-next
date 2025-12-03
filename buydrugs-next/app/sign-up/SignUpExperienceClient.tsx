'use client';

import { useState } from 'react';
import { signUpWithEmail } from '@/actions/auth';
import { createClient } from '@/lib/supabase/client';
import SignUpExperience, {
  RoleValue,
  SignUpFormPayload,
} from '@/components/ui/sign-up';

interface SignUpExperienceClientProps {
  initialRole?: RoleValue;
  roleLocked?: boolean;
}

export default function SignUpExperienceClient({
  initialRole,
  roleLocked,
}: SignUpExperienceClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<RoleValue | null>(null);

  const handleSubmit = async (payload: SignUpFormPayload) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const metadata = {
        system_role: 'patient',
        experience_role: payload.role,
        full_name: payload.account.fullName,
        phone: payload.account.phone,
        profile: {
          date_of_birth: payload.profile.dateOfBirth,
          gender: payload.profile.gender,
          health_considerations: payload.profile.healthConsiderations,
          current_prescriptions: payload.profile.currentPrescriptions,
          extra_notes: payload.profile.extraNotes,
          share_health_profile: payload.profile.shareHealthProfile,
          profile_photo_name: payload.profile.profilePhotoName,
        },
        consents: payload.consents,
        provider_intent: payload.role === 'customer' ? null : payload.role,
        provider_profile: payload.providerProfile ?? null,
      };

      const result = await signUpWithEmail(
        payload.account.email,
        payload.account.password,
        metadata
      );

      if (!result.success) {
        setError(result.error ?? 'Failed to create account');
        setIsSubmitting(false);
        return;
      }

      setSuccessRole(payload.role);
    } catch (signupError) {
      console.error(signupError);
      setError('An unexpected error occurred while creating your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async (role: RoleValue) => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Store the active onboarding role in localStorage so we can retrieve it after OAuth redirect
      const activeRole = role || initialRole || 'customer';
      try {
        localStorage.setItem('active_onboarding_role', activeRole);
      } catch (storageError) {
        console.warn('Unable to access localStorage:', storageError);
      }
      console.log('[SignUpExperienceClient] Storing active onboarding role:', {
        role,
        initialRole,
        activeRole,
        timestamp: new Date().toISOString(),
      });

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.log('OAuth error details:', error);
        setError(error.message);
        setIsSubmitting(false);
        // Clean up localStorage on error
        try {
          localStorage.removeItem('active_onboarding_role');
        } catch (storageError) {
          console.warn('Unable to access localStorage:', storageError);
        }
      }
      // OAuth will redirect, so no need to handle success state here
    } catch (oauthError) {
      console.error('OAuth exception:', oauthError);
      setError('Failed to initialize Google sign in.');
      setIsSubmitting(false);
      try {
        localStorage.removeItem('active_onboarding_role');
      } catch (storageError) {
        console.warn('Unable to access localStorage:', storageError);
      }
    }
  };
  return (
    <SignUpExperience
      onSubmit={handleSubmit}
      onGoogleSignIn={handleGoogleSignIn}
      isSubmitting={isSubmitting}
      error={error}
      successRole={successRole}
      initialRole={initialRole}
      roleLocked={roleLocked}
      onReset={() => {
        setSuccessRole(null);
      }}
      onRoleChange={(role) => {
        // Update localStorage when role changes
        try {
          localStorage.setItem('active_onboarding_role', role);
          console.log('[SignUpExperienceClient] Role changed, updated localStorage:', {
            newRole: role,
            timestamp: new Date().toISOString(),
          });
        } catch (storageError) {
          console.error('Unable to update localStorage when role changed:', storageError);
        }
      }}
    />
  );
}



