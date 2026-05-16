import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { MetaMaskLogo } from './MetaMaskLogo';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#1a0a00] py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-600/25 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mb-6 flex justify-center">
          <MetaMaskLogo className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to visualize your{' '}
          <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            MetaMask Card
          </span>{' '}
          spending?
        </h2>
        <p className="mt-4 text-lg text-orange-100/70">
          Connect your MetaMask Card and get a complete picture of your spending in seconds.
          No private keys. No seed phrases. Just insights.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="gap-2 text-base bg-[#F6851B] hover:bg-[#E2761B] text-white border-0 shadow-xl shadow-orange-500/40"
          >
            <Link href="/auth/login">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 text-base"
          >
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
