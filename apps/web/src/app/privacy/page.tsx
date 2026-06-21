import Link from 'next/link';
import type { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { FoxMark } from '@/components/brand/FoxMark';

export const metadata: Metadata = {
  title: 'Privacy Policy — MetaSpend',
  description: 'How MetaSpend collects, uses, and protects your data.',
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: June 21, 2026</p>

        <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
          MetaSpend (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) provides a web dashboard and browser
          extension that help MetaMask Card users track and understand their spending. This policy
          explains what data we collect, why, and how it&apos;s handled.
        </p>

        <Section title="1. Account information">
          <p>When you create a MetaSpend account, we collect:</p>
          <ul>
            <li>Email address and a hashed password (if you sign up with email/password), or</li>
            <li>
              Your Ethereum wallet address (if you sign in with &quot;Sign-In with Ethereum&quot; — we
              never see or store your private keys; wallet sign-in only proves you control the
              address via a signed message).
            </li>
          </ul>
        </Section>

        <Section title="2. Transaction data via the browser extension">
          <p>
            The MetaSpend browser extension reads the MetaMask Card and MetaMask Portfolio web pages
            (card.metamask.io and portfolio.metamask.io) that you have open in your own browser, and
            extracts the transaction history already visible to you on those pages. Specifically, the
            extension reads:
          </p>
          <ul>
            <li>Merchant name</li>
            <li>Transaction date, time, amount, and status (pending/settled/declined/refunded)</li>
            <li>Masked card number (last digits only, as shown on the MetaMask Card page) and funding source</li>
            <li>Crypto amount spent and network gas fee</li>
            <li>Your card balance, as displayed on the page</li>
          </ul>
          <p>
            This data is sent to MetaSpend&apos;s servers over an encrypted (HTTPS) connection,
            authenticated with a private pairing token generated from your MetaSpend account
            (Settings → Browser extension). The extension does not collect your browsing history,
            location, or any data from websites other than the two MetaMask domains listed above, and
            does not use cookies or third-party tracking.
          </p>
        </Section>

        <Section title="3. Merchant categorization">
          <p>
            To automatically sort your transactions into spending categories, MetaSpend uses a
            combination of (a) categories you&apos;ve manually assigned in the past, (b) simple
            built-in matching rules, and (c) for merchants it hasn&apos;t seen before, an AI
            categorization step that sends the merchant name (not the transaction amount, date, or any
            other transaction detail) to OpenAI&apos;s API to suggest a category. You can review,
            correct, or override any AI-suggested category at any time.
          </p>
        </Section>

        <Section title="4. How we store your data">
          <p>
            Your account and transaction data are stored in a private Postgres database operated by
            MetaSpend. We do not sell, rent, or share your personal or transaction data with third
            parties for advertising or any other purpose. Data is retained for as long as your account
            is active; you may request deletion of your account and all associated data at any time
            (see Contact, below).
          </p>
        </Section>

        <Section title="5. Third-party services we use">
          <ul>
            <li>
              <strong>OpenAI</strong> — receives merchant names only (see Section 3), used solely to
              suggest spending categories.
            </li>
            <li>We do not use any analytics, advertising, or tracking pixels on the MetaSpend dashboard.</li>
          </ul>
        </Section>

        <Section title="6. Your choices">
          <ul>
            <li>
              You can disconnect the browser extension at any time from the extension popup or from
              Settings in the web app, which immediately revokes its access token.
            </li>
            <li>You can delete individual transactions, categories, or your entire account from the web app.</li>
            <li>You can request a copy or deletion of your data by contacting us (below).</li>
          </ul>
        </Section>

        <Section title="7. Security">
          <p>
            Passwords are stored using industry-standard hashing (bcrypt) and never in plain text. API
            access uses short-lived authentication tokens. The browser extension&apos;s pairing token
            is scoped only to the transaction-sync endpoint it needs and can be revoked at any time.
          </p>
        </Section>

        <Section title="8. Changes to this policy">
          <p>
            We may update this policy as MetaSpend evolves. Material changes will be reflected by
            updating the &quot;Last updated&quot; date above.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Questions about this policy or your data? Contact us at{' '}
            <a href="mailto:privacy@metaspend.app" className="text-foreground underline">
              privacy@metaspend.app
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
