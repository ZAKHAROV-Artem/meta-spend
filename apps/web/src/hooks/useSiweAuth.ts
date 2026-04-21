'use client';

import { useState } from 'react';
import { useAccount, useSignMessage, useChainId } from 'wagmi';
import { createSiweMessage } from 'viem/siwe';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001';

export function useSiweAuth() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithEthereum = async () => {
    if (!address) { setError('No wallet connected'); return; }
    setIsLoading(true);
    setError(null);

    try {
      const nonceRes = await fetch(`${API_URL}/api/v1/auth/siwe/nonce`);
      const { nonce } = await nonceRes.json() as { nonce: string };

      const message = createSiweMessage({
        address,
        chainId,
        domain: window.location.host,
        nonce,
        uri: window.location.origin,
        version: '1',
        statement: 'Sign in to CryptoTrack',
      });

      const signature = await signMessageAsync({ message });

      const result = await signIn('siwe', { message, signature, redirect: false });
      if (result?.error) {
        setError('Sign-in failed. Please try again.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed';
      if (msg.includes('rejected') || msg.includes('denied')) {
        setError('Signature rejected.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithEthereum, isLoading, error, canSign: !!address };
}
