import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section
      className="w-full overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #fff8f2 0%, #fef3e8 50%, #fff 100%)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: text content */}
          <div className="flex flex-col items-start">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Smart analytics for your{' '}
              <span className="text-[#F6851B]">MetaMask Card</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Track every spend, categorize automatically, understand your habits.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="gap-2 text-base bg-[#F6851B] hover:bg-[#E2761B] text-white border-0 shadow-lg shadow-orange-500/30"
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
                className="text-base text-gray-700 border-gray-300 hover:bg-gray-50"
              >
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>

          {/* Right: static card widget */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm">
              {/* Main card */}
              <div className="relative rounded-2xl bg-[#1a0d00] p-5 shadow-2xl text-white">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium tracking-widest text-orange-300/70 uppercase">
                      MetaMask
                    </p>
                    <p className="mt-0.5 text-base font-bold">Card</p>
                  </div>
                  <span className="text-2xl">🦊</span>
                </div>
                <div className="mb-2">
                  <p className="text-xs text-orange-200/50 tracking-widest uppercase mb-1">Balance</p>
                  <p className="text-3xl font-bold tracking-tight">$2,847.50</p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10">
                  <p className="font-mono text-xs text-orange-200/50 tracking-wider">0x71C7…9e2B</p>
                </div>

                {/* Floating chip: top right */}
                <div className="absolute -top-4 -right-4 rounded-xl bg-white px-3 py-2 shadow-lg">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">This month</p>
                  <p className="mt-0.5 text-base font-bold text-gray-900">$648.20</p>
                </div>

                {/* Floating chip: bottom left */}
                <div className="absolute -bottom-4 -left-4 rounded-xl bg-white px-3 py-2 shadow-lg">
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Top category</p>
                  <p className="mt-0.5 text-sm font-bold text-gray-900">🍕 Food &amp; Dining</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
