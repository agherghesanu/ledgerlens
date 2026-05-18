import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    description: 'Perfect for individuals exploring financial case analysis.',
    cta: 'Get Started',
    ctaHref: '/register',
    ctaStyle: 'border border-border text-text-dim',
    features: [
      '3 active cases per month',
      'AI-generated feedback',
      'Basic skill tracking',
      'Over-Trust Index gauge',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15',
    period: '/mo',
    description: 'For serious analysts building expert-level judgment.',
    cta: 'Start Pro',
    ctaHref: '/settings?section=billing',
    ctaStyle: 'bg-indigo text-[#0d0d15] font-semibold',
    features: [
      'Unlimited cases',
      'Voice feedback synthesis',
      'Advanced pattern analysis',
      'Expert post-mortem narration',
      'Full history & exports',
      'Priority scoring speed',
    ],
    highlight: true,
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '$199',
    period: '/mo',
    description: 'For finance teams and educational institutions.',
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@ledgerlens.app',
    ctaStyle: 'border border-border text-text-dim',
    features: [
      'Everything in Pro',
      'Up to 25 team members',
      'Custom case creation',
      'Employee skill dashboards',
      'Institutional admin panel',
      'SSO / SAML support (coming soon)',
      'Dedicated onboarding',
    ],
    highlight: false,
  },
] as const

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero */}
      <div className="text-center px-8 pt-16 pb-12">
        <p className="cap text-[11px] text-indigo mb-4">PRICING</p>
        <h1 className="font-display font-bold text-[40px] leading-[1.1] tracking-[-0.02em] text-text m-0 mb-4">
          Build expert judgment.<br />Pick your plan.
        </h1>
        <p className="text-[17px] text-text-dim max-w-xl mx-auto m-0">
          LedgerLens trains analysts to spot AI mistakes in financial analysis. Start free, go Pro when you&apos;re serious.
        </p>
      </div>

      {/* Plan cards */}
      <div className="flex items-start justify-center gap-6 px-8 pb-20 max-w-5xl mx-auto w-full">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col flex-1 rounded-2xl border p-7 gap-6 ${
              plan.highlight
                ? 'border-indigo/40 bg-card relative'
                : 'border-border bg-card'
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="cap text-[10px] px-3 py-1 rounded-full bg-indigo text-[#0d0d15]">MOST POPULAR</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="cap text-[11px] text-text-mute">{plan.name.toUpperCase()}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-[36px] text-text">{plan.price}</span>
                {plan.period && <span className="text-text-dim text-[15px]">{plan.period}</span>}
              </div>
              <p className="text-[13px] text-text-dim m-0">{plan.description}</p>
            </div>

            <Link
              href={plan.ctaHref}
              className={`flex items-center justify-center h-10 rounded-lg font-mono text-sm no-underline ${plan.ctaStyle}`}
            >
              {plan.cta}
            </Link>

            <ul className="flex flex-col gap-3 m-0 p-0 list-none">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-text-dim">
                  <span className="text-green mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Institutional callout */}
      <div className="border-t border-border px-8 py-12 text-center">
        <h2 className="font-display font-bold text-[22px] text-text m-0 mb-2">
          Running a training program?
        </h2>
        <p className="text-[15px] text-text-dim m-0 mb-6 max-w-lg mx-auto">
          The Teams plan lets institutions upload proprietary cases, manage employee accounts, and track skill progression across teams.
        </p>
        <Link
          href="mailto:sales@ledgerlens.app"
          className="font-mono text-sm h-10 px-6 rounded-lg border border-border text-text-dim inline-flex items-center no-underline hover:border-indigo/40 hover:text-text transition-colors"
        >
          Talk to us about institutional pricing →
        </Link>
      </div>
    </div>
  )
}
