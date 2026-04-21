'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useSiweAuth } from '@/hooks/useSiweAuth';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';

export function SiweButton() {
  const { isConnected, address } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signInWithEthereum, isLoading, error } = useSiweAuth();

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
        {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Disconnect
        </button>
      </div>
      <Button
        type="button"
        className="w-full gap-2"
        onClick={signInWithEthereum}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isLoading ? 'Waiting for signature...' : 'Sign in with Ethereum'}
      </Button>
      {error && <p className="text-sm text-destructive text-center">{error}</p>}
    </div>
  );
}
