import Link from 'next/link';
import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { FoxMark } from '@/components/brand/FoxMark';

export const metadata: Metadata = {
  title: 'Terms of Service — MetaSpend',
  description: 'The terms that govern your use of MetaSpend.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 21, 2026</p>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          By creating a MetaSpend account or installing the MetaSpend browser extension, you agree to
          these terms.
        </p>

        <Section title="1. What MetaSpend is">
          <p>
            MetaSpend is a personal finance tracking tool for MetaMask Card users. It is an independent
            product and is <strong>not affiliated with, endorsed by, or operated by MetaMask or
            Consensys</strong>. MetaSpend reads transaction data that the MetaMask Card portal already
            displays to you and organizes it into categorized spending insights.
          </p>
        </Section>

        <Section title="2. Your account">
          <p>
            You&apos;re responsible for keeping your login credentials (or the wallet you use to sign
            in) secure. You must be the legitimate owner or authorized user of any MetaMask Card
            account whose transactions you sync through MetaSpend.
          </p>
        </Section>

        <Section title="3. The browser extension">
          <p>
            The MetaSpend browser extension only operates on card.metamask.io and
            portfolio.metamask.io. It reads transaction information visible on those pages and
            transmits it to MetaSpend&apos;s servers once you&apos;ve paired the extension with your
            account using a pairing code generated in the web app. You can disconnect the extension at
            any time, which immediately stops any further data sync.
          </p>
        </Section>

        <Section title="4. Accuracy of data">
          <p>
            MetaSpend extracts data directly from pages rendered by MetaMask&apos;s own services. We do
            not control the formatting or accuracy of that source data, and MetaMask may change its
            page structure at any time, which can cause sync errors or gaps. MetaSpend is a convenience
            tool for tracking and visualizing your spending — it is not a substitute for your official
            MetaMask Card statements, and should not be relied upon as the sole record of your
            transactions for tax, accounting, or legal purposes.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p>You agree not to:</p>
          <ul>
            <li>Use MetaSpend to access or sync transaction data that isn&apos;t your own,</li>
            <li>
              Attempt to reverse-engineer, scrape, or abuse the MetaSpend API outside of the official
              extension and web app,
            </li>
            <li>Use MetaSpend for any unlawful purpose.</li>
          </ul>
        </Section>

        <Section title="6. No financial advice">
          <p>
            MetaSpend provides spending visualization and categorization only. Nothing in the product
            constitutes financial, investment, tax, or legal advice.
          </p>
        </Section>

        <Section title="7. Service availability">
          <p>
            MetaSpend is provided &quot;as is,&quot; without warranties of any kind. We aim for high
            availability but do not guarantee uninterrupted access, and we may modify or discontinue
            features at any time.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the maximum extent permitted by law, MetaSpend and its operators are not liable for any
            indirect, incidental, or consequential damages arising from your use of the service,
            including but not limited to inaccuracies in synced transaction data or service
            interruptions.
          </p>
        </Section>

        <Section title="9. Termination">
          <p>
            You may stop using MetaSpend and delete your account at any time. We may suspend or
            terminate accounts that violate these terms or the Acceptable Use section above.
          </p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            We may update these terms as MetaSpend evolves. Continued use after an update constitutes
            acceptance of the revised terms.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions about these terms? Contact us at{' '}
            <a href="mailto:support@metaspend.app" className="text-foreground underline">
              support@metaspend.app
            </a>
            .
          </p>
        </Section>
      </main>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FoxMark className="h-5 w-5" /> MetaSpend
          </Link>
          <p className="text-xs text-muted-foreground/60">© 2026 MetaSpend. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
