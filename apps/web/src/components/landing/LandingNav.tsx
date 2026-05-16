import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MetaMaskLogo } from './MetaMaskLogo';

export function LandingNav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2.5 text-white font-semibold text-lg">
        🦊
        MetaSpend
      </Link>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" className="text-white hover:bg-white/10">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild className="bg-[#F6851B] text-white hover:bg-[#E2761B] border-0 shadow-lg shadow-orange-500/30">
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    </nav>
  );
}
