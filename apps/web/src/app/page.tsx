import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { CTASection } from '@/components/landing/CTASection';

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 MetaSpend. MetaMask Card transaction visualization.</p>
      </footer>
    </>
  );
}
