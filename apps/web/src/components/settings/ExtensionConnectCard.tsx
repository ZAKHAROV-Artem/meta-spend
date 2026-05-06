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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Puzzle className="h-4 w-4 text-primary" />
          Browser extension
        </CardTitle>
        <CardDescription className="text-xs">
          Pair the extension to sync MetaMask Card activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" size="sm" onClick={() => void handleGenerate()} disabled={pairCode.isPending}>
          {pairCode.isPending ? 'Generating…' : 'Generate pairing code'}
        </Button>
        {pairCode.error && <p className="text-xs text-destructive">{pairCode.error.message}</p>}

        {lastCode ? (
          <div className="rounded-lg border border-border bg-background px-4 py-4">
            <p className="text-xs text-muted-foreground">Your code</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-2xl font-semibold tracking-[0.18em] text-foreground">{lastCode.code}</span>
              <Button type="button" variant="outline" size="icon-sm" onClick={() => void handleCopy()}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <Badge variant="secondary" className="text-[11px]">
                Expires {new Date(lastCode.expiresAt).toLocaleTimeString()}
              </Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Enter this code in the extension popup.</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
