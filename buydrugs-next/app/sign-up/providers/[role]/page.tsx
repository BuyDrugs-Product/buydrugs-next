import { notFound } from 'next/navigation';
import SignUpExperienceClient from '@/app/sign-up/SignUpExperienceClient';
import { RoleValue } from '@/components/ui/sign-up';

interface ProviderSignUpPageProps {
  params: Promise<{
    role: string;
  }>;
}

const providerRoles: RoleValue[] = ['pharmacy_admin', 'pharmacy_staff'];

export default async function ProviderSignUpPage({ params }: ProviderSignUpPageProps) {
  const { role } = await params;
  const normalizedRole = role.replace('-', '_') as RoleValue;

  if (!providerRoles.includes(normalizedRole)) {
    notFound();
  }

  return <SignUpExperienceClient initialRole={normalizedRole} roleLocked />;
}





