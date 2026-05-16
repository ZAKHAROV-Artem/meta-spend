import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { SiweButton } from '@/components/auth/SiweButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Create account — MetaSpend' };

export default function RegisterPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Sign up with wallet</CardTitle>
          <CardDescription>Connect MetaMask and sign to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <SiweButton />
        </CardContent>
      </Card>

      <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 border-t" />
        <span>or create account with email</span>
        <div className="flex-1 border-t" />
      </div>

      <RegisterForm />
    </div>
  );
}
