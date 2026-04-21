import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <Link href="/" className="relative mb-8 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
          <Zap className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="text-lg font-bold text-foreground">
          Crypto<span className="text-primary">Track</span>
        </span>
      </Link>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
