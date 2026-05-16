'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSignMessage } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { createSiweMessage } from 'viem/siwe';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

type SiweVerifyResponse = {
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
  accessToken?: string;
  refreshToken?: string;
  user: { id: string; email: string };
};

export function SiweButton() {
  const { isConnected, address } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSiwe() {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const nonceRes = await fetch(`${API_URL}/api/v1/auth/siwe/nonce`);
      if (!nonceRes.ok) throw new Error('Failed to fetch nonce');
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: '1',
        statement: 'Sign in to MetaSpend',
      });
      const signature = await signMessageAsync({ message });

      const verifyRes = await fetch(`${API_URL}/api/v1/auth/siwe/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature }),
      });
      if (!verifyRes.ok) throw new Error('SIWE verification failed');
      const data = (await verifyRes.json()) as SiweVerifyResponse;

      if (data.supabaseAccessToken && data.supabaseRefreshToken) {
        const supabase = createClient();
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: data.supabaseAccessToken,
          refresh_token: data.supabaseRefreshToken,
        });
        if (setSessionError) throw setSessionError;
      } else {
        // Supabase not configured on backend — surface a helpful error.
        throw new Error('Supabase auth not configured. Set SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY on the API.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      if (msg.toLowerCase().includes('rejected') || msg.toLowerCase().includes('denied')) {
        setError('Signature rejected.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        onClick={() => connect({ connector: injected() })}
        disabled={isConnecting}
      >
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isConnecting ? 'Connecting…' : 'Continue with MetaMask'}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono">
            {address?.slice(0, 6)}…{address?.slice(-4)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </button>
      </div>
      <Button type="button" className="w-full gap-2" onClick={handleSiwe} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isLoading ? 'Waiting for signature…' : 'Sign in with Ethereum'}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
