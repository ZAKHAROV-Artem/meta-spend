import {
  Wallet,
  List,
  Tag,
  DollarSign,
  BarChart2,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Wallet Connection',
    description:
      'Connect MetaMask in one click. Support for Ethereum, Polygon, Arbitrum, Base, and more chains.',
  },
  {
    icon: List,
    title: 'Transaction History',
    description:
      'Fetch your complete on-chain history: transfers, ERC-20s, swaps, bridge transactions, and contract calls.',
  },
  {
    icon: Tag,
    title: 'Smart Categorization',
    description:
      'Transactions are automatically classified into expenses, swaps, bridges, and gas fees. Override anything manually.',
  },
  {
    icon: DollarSign,
    title: 'Fiat Conversion',
    description:
      'See every transaction in USD or your local currency using historical prices at the time of the transaction.',
  },
  {
    icon: BarChart2,
    title: 'Spending Analytics',
    description:
      'Monthly reports, category breakdowns, and spending trends — exactly like your bank app.',
  },
  {
    icon: Zap,
    title: 'Rules Engine',
    description:
      'Automate categorization with custom rules. "If address = X, category = Food." Applied to all future transactions.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand your crypto spending
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A semantic layer on top of blockchain data — turning public transactions into
            meaningful financial insights.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
