'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import SignUpExperience, {
    RoleValue,
    SignUpFormPayload,
} from '@/components/ui/sign-up';

export default function CompleteProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [initialData, setInitialData] = useState<any>(null);
    const [role, setRole] = useState<RoleValue>('customer');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/sign-in');
                return;
            }

            // Read active onboarding role from localStorage (set during OAuth sign-up or role selection)
            // Wrap in try/catch to handle private browsing or disabled storage
            let activeOnboardingRole: string | null = null;
            let legacyStoredRole: string | null = null;

            try {
                activeOnboardingRole = localStorage.getItem('active_onboarding_role');
                legacyStoredRole = localStorage.getItem('signup_role'); // Support legacy key
            } catch (error) {
                console.warn('[CompleteProfile] localStorage read failed (private browsing or disabled):', error);
            }

            const metadataRole = user.user_metadata?.experience_role;

            // Determine the active role: prioritize localStorage, then metadata, then default to customer
            const activeRole = (activeOnboardingRole || legacyStoredRole || metadataRole || 'customer') as RoleValue;

            console.log('[CompleteProfile] Role detection:', {
                activeOnboardingRole,
                legacyStoredRole,
                metadataRole,
                finalRole: activeRole,
                userMetadata: user.user_metadata,
                timestamp: new Date().toISOString(),
            });

            // Check role-specific onboarding completion
            const roleOnboardingKey = `onboarding_complete_${activeRole}`;
            const isRoleOnboardingComplete = user.user_metadata?.[roleOnboardingKey] === true;
            const isGeneralOnboardingComplete = user.user_metadata?.onboarding_complete === true;

            console.log('[CompleteProfile] Onboarding status check:', {
                activeRole,
                roleOnboardingKey,
                isRoleOnboardingComplete,
                isGeneralOnboardingComplete,
                allMetadata: user.user_metadata,
            });

            // If this specific role's onboarding is complete, redirect to home
            if (isRoleOnboardingComplete) {
                console.log(`[CompleteProfile] Onboarding complete for role "${activeRole}", redirecting to home`);
                router.push('/');
                return;
            }

            // Also check general onboarding_complete for backward compatibility
            if (isGeneralOnboardingComplete && !activeOnboardingRole && !legacyStoredRole) {
                console.log('[CompleteProfile] General onboarding complete (legacy), redirecting to home');
                router.push('/');
                return;
            }

            // Store the active role in localStorage if not already set
            if (!activeOnboardingRole && activeRole) {
                try {
                    localStorage.setItem('active_onboarding_role', activeRole);
                    console.log('[CompleteProfile] Stored active role in localStorage:', activeRole);
                } catch (error) {
                    console.warn('[CompleteProfile] localStorage write failed (private browsing or disabled):', error);
                }
            }

            setRole(activeRole);

            // Extract provider profile data from metadata if it exists
            const providerProfile = user.user_metadata?.provider_profile;

            setInitialData({
                fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email || '',
                // Pass provider profile if available for resumption
                providerProfile: providerProfile || null,
            });
            setIsLoading(false);
        };

        checkUser();
    }, [router]);

    const handleSubmit = async (payload: SignUpFormPayload) => {
        setError(null);
        setIsSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not found');
            }

            // Get the active role from payload (this is the role user is onboarding for)
            const activeRole = payload.role;
            const roleOnboardingKey = `onboarding_complete_${activeRole}`;

            console.log('[CompleteProfile] Submitting profile completion:', {
                activeRole,
                roleOnboardingKey,
                payloadRole: payload.role,
                currentMetadata: user.user_metadata,
                timestamp: new Date().toISOString(),
            });

            // Build update data with role-specific onboarding completion
            const updateData: any = {
                experience_role: activeRole, // Save the role from the form
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
                provider_profile: payload.providerProfile ?? null,
                onboarding_step: 'complete',
            };

            // Set role-specific onboarding completion flag
            updateData[roleOnboardingKey] = true;

            // For customer role, also set general onboarding_complete for backward compatibility
            if (activeRole === 'customer') {
                updateData.onboarding_complete = true;
            }

            // Preserve existing role-specific onboarding flags for other roles
            const existingMetadata = user.user_metadata || {};
            Object.keys(existingMetadata).forEach((key) => {
                if (key.startsWith('onboarding_complete_') && !updateData.hasOwnProperty(key)) {
                    updateData[key] = existingMetadata[key];
                }
            });

            console.log('[CompleteProfile] Updating user metadata:', {
                updateData,
                preservedFlags: Object.keys(updateData).filter(k => k.startsWith('onboarding_complete_')),
            });

            const { error: updateError } = await supabase.auth.updateUser({
                data: updateData
            });

            if (updateError) {
                throw updateError;
            }

            console.log('[CompleteProfile] Profile completion successful:', {
                activeRole,
                roleOnboardingKey,
                finalMetadata: (await supabase.auth.getUser()).data.user?.user_metadata,
            });

            // Clear localStorage after successful profile completion
            try {
                localStorage.removeItem('active_onboarding_role');
                localStorage.removeItem('signup_role'); // Also clear legacy key
            } catch (error) {
                console.warn('[CompleteProfile] localStorage cleanup failed (private browsing or disabled):', error);
            }

            // Redirect to home
            router.push('/');
            router.refresh();
        } catch (err: any) {
            console.error('[CompleteProfile] Profile completion error:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRoleChange = (newRole: RoleValue) => {
        console.log('[CompleteProfile] Role changed in form:', {
            oldRole: role,
            newRole,
            timestamp: new Date().toISOString(),
        });
        setRole(newRole);
        // Update localStorage with the new active role
        try {
            localStorage.setItem('active_onboarding_role', newRole);
            console.log('[CompleteProfile] Updated active_onboarding_role in localStorage:', newRole);
        } catch (error) {
            console.warn('[CompleteProfile] localStorage write failed (private browsing or disabled):', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-(--surface-app)">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <SignUpExperience
            initialRole={role}
            roleLocked={false}  // Allow users to change role if they want
            initialStep="profile"  // Start at profile step for better UX
            isSubmitting={isSubmitting}
            error={error}
            onSubmit={handleSubmit}
            initialData={initialData}
            initialProviderProfile={initialData?.providerProfile}
            isOAuthCompletion={true}
            onRoleChange={handleRoleChange}
        />
    );
}
