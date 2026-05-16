interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: '1',
    title: 'Install extension',
    description: 'Add the MetaSpend Chrome extension from the Web Store in one click.',
  },
  {
    number: '2',
    title: 'Sign in',
    description: 'Connect your MetaMask wallet or sign in with your email address.',
  },
  {
    number: '3',
    title: 'Auto-sync',
    description: 'Transactions sync automatically from MetaMask Portfolio — no manual imports.',
  },
  {
    number: '4',
    title: 'Get insights',
    description: 'See spending trends, categories, and analytics updated in real time.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#fafaf8] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Up and running in under a minute.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-start">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#F6851B] text-white font-bold text-base shadow-md shadow-orange-500/30">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
