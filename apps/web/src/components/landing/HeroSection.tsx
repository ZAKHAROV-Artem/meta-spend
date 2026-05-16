import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, Sparkles } from 'lucide-react';
import { MetaMaskLogo } from './MetaMaskLogo';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#1a0a00] text-white">
      {/* Orange radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/30 via-orange-900/10 to-transparent" />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#F6851B 1px, transparent 1px), linear-gradient(90deg, #F6851B 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300">
            <MetaMaskLogo className="h-4 w-4" />
            <span>MetaMask Card · Transaction Visualization</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            See every swipe of your{' '}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
              MetaMask Card
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-orange-100/70 sm:text-xl">
            Beautifully visualize your MetaMask Card spending. Track purchases, analyze categories,
            and understand exactly where your crypto goes — in real time.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="gap-2 text-base bg-[#F6851B] hover:bg-[#E2761B] text-white border-0 shadow-xl shadow-orange-500/40"
            >
              <Link href="/auth/login">
                Connect MetaMask Card
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-base"
            >
              <Link href="#features">See how it works</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-orange-200/60">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>No private keys required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>Real-time transaction feed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
              <span>Historical fiat conversion</span>
            </div>
          </div>

          {/* Mock card preview */}
          <div className="mt-20 mx-auto max-w-sm">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#F6851B] via-[#E2761B] to-[#CD6116] p-6 shadow-2xl shadow-orange-500/40 text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-xs text-orange-200/70 font-medium tracking-widest uppercase">MetaMask</span>
                  <span className="text-lg font-bold mt-0.5">Card</span>
                </div>
                <MetaMaskLogo className="h-10 w-10" />
              </div>
              <div className="mb-6">
                <p className="text-xs text-orange-200/60 tracking-widest mb-1">CARD NUMBER</p>
                <p className="font-mono text-sm tracking-widest">•••• •••• •••• 4291</p>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-orange-200/60 tracking-widest mb-0.5">BALANCE</p>
                  <p className="text-2xl font-bold">$1,284.50</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-orange-200/70">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Active</span>
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
