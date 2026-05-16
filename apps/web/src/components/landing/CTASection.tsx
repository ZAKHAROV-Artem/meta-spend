import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="bg-[#1a0d00] py-24 text-white">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start tracking your MetaMask Card spend
        </h2>
        <p className="mt-4 text-lg text-orange-100/70">
          Join thousands of MetaMask Card users getting clarity on their spending.
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
        </div>
      </div>
    </section>
  );
}
