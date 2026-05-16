const FEATURES = [
  {
    emoji: '📊',
    title: 'Transaction History',
    description: 'Complete record of every MetaMask Card spend, searchable and filterable.',
  },
  {
    emoji: '🏷️',
    title: 'Smart Categories',
    description: 'Auto-categorized with AI, fully customizable to match your spending style.',
  },
  {
    emoji: '📈',
    title: 'Spending Analytics',
    description: 'Charts and trends to understand your habits at a daily, weekly, and monthly level.',
  },
  {
    emoji: '🔔',
    title: 'Real-time Sync',
    description: 'Transactions appear as soon as you spend — no delays, no manual imports.',
  },
  {
    emoji: '🌙',
    title: 'Dark Mode',
    description: 'Easy on the eyes, day or night. Follows your system preference automatically.',
  },
  {
    emoji: '🔐',
    title: 'Secure & Private',
    description: 'Your data, your control. We never ask for private keys or seed phrases.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            A complete financial layer on top of your MetaMask Card.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md hover:shadow-orange-500/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                {feature.emoji}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
