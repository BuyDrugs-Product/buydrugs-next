import { notFound } from 'next/navigation';
import SignUpExperienceClient from '@/app/sign-up/SignUpExperienceClient';
import { RoleValue } from '@/components/ui/sign-up';

interface ProviderSignUpPageProps {
  params: {
    role: string;
  };
}

const providerRoles: RoleValue[] = ['pharmacy_admin', 'pharmacy_staff'];

export default function ProviderSignUpPage({ params }: ProviderSignUpPageProps) {
  const normalizedRole = params.role.replace('-', '_') as RoleValue;

  if (!providerRoles.includes(normalizedRole)) {
    notFound();
  }

  return <SignUpExperienceClient initialRole={normalizedRole} roleLocked />;
}





