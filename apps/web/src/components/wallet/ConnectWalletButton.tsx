'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function ConnectWalletButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/65 px-3 py-1.5 shadow-sm backdrop-blur sm:flex">
          <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(45,212,191,0.38)]" />
          <span className="font-mono text-xs text-foreground">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" className="h-9 px-3 text-xs" onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => connect({ connector: injected() })}
      disabled={isConnecting}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
    </Button>
  );
}
