'use client';

import { useState } from 'react';
import { useExtensionPairCode } from '@/hooks/api/useExtensionPairCode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Puzzle, Copy, Check } from 'lucide-react';

export function ExtensionConnectCard() {
  const pairCode = useExtensionPairCode();
  const [lastCode, setLastCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const res = await pairCode.mutateAsync({});
    setLastCode({ code: res.code, expiresAt: res.expiresAt });
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!lastCode) return;
    await navigator.clipboard.writeText(lastCode.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="bg-card/72">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Puzzle className="h-4 w-4 text-primary" />
          Browser extension (MetaMask Card)
        </CardTitle>
        <CardDescription className="text-xs">
          Generate a one-time 6-digit code, enter it in the CryptoTrack extension popup while signed into this
          account, then open{' '}
          <span className="font-medium text-foreground">portfolio.metamask.io</span> — card activity syncs in the
          background.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" size="sm" onClick={() => void handleGenerate()} disabled={pairCode.isPending}>
          {pairCode.isPending ? 'Generating…' : 'Generate pairing code'}
        </Button>
        {pairCode.error && <p className="text-xs text-destructive">{pairCode.error.message}</p>}

        {lastCode ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-background/55 px-4 py-4 backdrop-blur-xl">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your code</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xl font-semibold tracking-[0.2em] text-foreground">{lastCode.code}</span>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => void handleCopy()}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Badge variant="secondary" className="text-[11px]">
                Expires {new Date(lastCode.expiresAt).toLocaleTimeString()}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Install the extension: Chrome → Extensions → Developer mode → <strong>Load unpacked</strong> → select{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">apps/extension/dist</code> from
              this repo after running <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">pnpm --filter @crypto-tracker/extension build</code>.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
