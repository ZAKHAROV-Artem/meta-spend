'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthCard } from '../auth-card';
import { SiweButton } from '../siwe-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [mode, setMode] = useState<'password' | 'magic'>('password');

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === 'magic') {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (otpError) setError(otpError.message);
      else setMagicLinkSent(true);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
      else {
        router.push('/dashboard');
        router.refresh();
      }
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (signUpError) setError(signUpError.message);
    else router.push('/auth/confirm');
    setLoading(false);
  }

  async function handleGoogle() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(oauthError.message);
  }

  if (magicLinkSent) {
    return (
      <AuthCard>
        <div className="text-center space-y-2">
          <div className="text-3xl">📬</div>
          <h2 className="text-lg font-semibold">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to <strong>{email}</strong>
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-sm text-primary hover:underline"
          >
            Try a different email
          </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <Tabs defaultValue="signin">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="signin" className="flex-1">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            Create account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin">
          {mode === 'password' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMode('magic');
                  setError(null);
                }}
                className="w-full text-sm text-primary hover:underline text-center block"
              >
                Send magic link instead →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email-magic">Email</Label>
                <Input
                  id="email-magic"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send magic link'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError(null);
                }}
                className="w-full text-sm text-muted-foreground hover:underline text-center block"
              >
                ← Back to password
              </button>
            </form>
          )}
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs text-muted-foreground">
          <span className="bg-card px-2">or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full gap-2" onClick={handleGoogle} type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
        <SiweButton />
      </div>
    </AuthCard>
  );
}
