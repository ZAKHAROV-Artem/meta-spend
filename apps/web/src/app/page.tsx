import Link from 'next/link';
import { FoxMark } from '@/components/brand/FoxMark';
import { LenisProvider } from '@/providers/LenisProvider';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DashboardPreviewSection } from '@/components/landing/DashboardPreviewSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <LenisProvider>
      <LandingNav />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
                <FoxMark className="h-6 w-6" />
                MetaSpend
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Smart spending analytics for MetaMask Card users. Real-time sync, AI categorization, and beautiful insights.
              </p>
              <p className="text-xs text-muted-foreground/60">Built for MetaMask Card users worldwide.</p>
            </div>

            {/* Product links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Product</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Features', href: '#features' },
                  { label: 'Dashboard', href: '/auth/login' },
                  { label: 'Sign in', href: '/auth/login' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
              <ul className="flex flex-col gap-2.5">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Service', href: '/terms' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 sm:flex-row">
            <p className="text-xs text-muted-foreground">© 2025 MetaSpend. All rights reserved.</p>
            <p className="text-xs text-muted-foreground/50">
              Not affiliated with MetaMask or Consensys.
            </p>
          </div>
        </div>
      </footer>
    </LenisProvider>
  );
}
