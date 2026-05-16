import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          🦊 MetaSpend
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="text-gray-700 hover:text-gray-900">
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="bg-[#F6851B] text-white hover:bg-[#E2761B] border-0 shadow-md shadow-orange-500/20"
          >
            <Link href="/auth/login">Get started free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
