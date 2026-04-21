import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { SiweButton } from '@/components/auth/SiweButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Sign in — CryptoTrack' };

export default function LoginPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl">Sign in with wallet</CardTitle>
          <CardDescription>One click, no password needed</CardDescription>
        </CardHeader>
        <CardContent>
          <SiweButton />
        </CardContent>
      </Card>

      <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 border-t" />
        <span>or sign in with email</span>
        <div className="flex-1 border-t" />
      </div>

      <LoginForm />
    </div>
  );
}
