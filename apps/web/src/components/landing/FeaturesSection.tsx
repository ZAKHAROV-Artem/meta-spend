import {
  CreditCard,
  BarChart3,
  Tag,
  RefreshCw,
  Globe,
  ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  {
    icon: CreditCard,
    title: 'Card Transaction Feed',
    description:
      'Every MetaMask Card purchase appears instantly in a clean, chronological feed — merchant name, amount, and category at a glance.',
  },
  {
    icon: BarChart3,
    title: 'Spending Analytics',
    description:
      'Interactive charts show where your money goes: daily, weekly, and monthly breakdowns with trend detection and budget tracking.',
  },
  {
    icon: Tag,
    title: 'Smart Categorization',
    description:
      'Transactions are automatically tagged by merchant type — food, travel, shopping, subscriptions, and more. Override anything manually.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Fiat Conversion',
    description:
      'See every transaction in USD or your local currency, converted at the exact rate at the time of purchase using live price feeds.',
  },
  {
    icon: Globe,
    title: 'Multi-currency Support',
    description:
      'Whether your card is funded in ETH, USDC, or another token, MetaSpend shows you a unified fiat view of all your spending.',
  },
  {
    icon: ShieldCheck,
    title: 'Read-only & Secure',
    description:
      'We never ask for private keys or seed phrases. MetaSpend connects to your MetaMask Card data securely via read-only access.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400">
            Built for MetaMask Card
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand your card spending
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A beautiful financial layer on top of your MetaMask Card — turning raw payment data
            into meaningful insights.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md hover:shadow-orange-500/10"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
