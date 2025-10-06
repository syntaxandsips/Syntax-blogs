import type { Metadata } from 'next';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const commitments = [
  {
    title: 'Fairness',
    description: 'We enforce policies consistently and review feedback before rolling out changes.',
  },
  {
    title: 'Partnership',
    description: 'You get advance notice about pricing, feature, and policy updates—no surprises.',
  },
  {
    title: 'Clarity',
    description: 'Plain language terms, transparent billing, and accessible documentation across the product.',
  },
];

const termsSections = [
  {
    title: 'Using Syntax & Sips',
    description: 'These terms outline how you can use our platform, content, and services.',
    bullets: [
      'You must be at least 16 years old to create an account and are responsible for the activity that happens on it.',
      'Do not misuse the platform—no illegal content, spam, or actions that disrupt other users or services.',
      'We may update features and pricing over time; we will always provide notice of significant changes.',
    ],
  },
  {
    title: 'Your content',
    description: 'You retain ownership of what you create while allowing us to host and display it.',
    bullets: [
      'You grant Syntax & Sips a limited license to host, process, and display your content for platform functionality.',
      'You are responsible for ensuring you have the rights to publish the material you upload.',
      'We may remove content that violates these terms or applicable laws.',
    ],
  },
  {
    title: 'Payments & subscriptions',
    description: 'Some features require a paid plan. Here is how billing works.',
    bullets: [
      'Paid plans renew automatically unless you cancel before the renewal date.',
      'Taxes may apply depending on your location and will be clearly displayed at checkout.',
      'Refund requests are evaluated case-by-case according to consumer protection laws.',
    ],
  },
];

const supportChannels = [
  {
    title: 'Billing support',
    description: 'Email billing@syntaxandsips.com if you need help understanding charges or managing invoices.',
  },
  {
    title: 'Legal questions',
    description: 'Reach our legal team at legal@syntaxandsips.com to clarify clauses or request signed agreements.',
  },
];

export const metadata: Metadata = {
  title: 'Terms of Service | Syntax & Sips',
  description: 'Review the legal terms that govern your use of Syntax & Sips products and services.',
};

export default function TermsPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Terms of service"
      description="We aim for clarity in how we operate. These terms are designed to protect both you and our community."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="scale">⚖️</span>}
        title="Our commitments"
        description="You deserve a dependable partner. These promises guide how we run Syntax & Sips."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {commitments.map((commitment) => (
            <div key={commitment.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{commitment.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{commitment.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      {termsSections.map((section) => (
        <ContentSection
          key={section.title}
          eyebrow={<span role="img" aria-label="document">📝</span>}
          title={section.title}
          description={section.description}
        >
          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
            {section.bullets.map((item) => (
              <li key={item} className="flex gap-3 rounded-3xl border-2 border-dashed border-black/30 bg-white px-4 py-3">
                <span aria-hidden className="font-bold text-[#06d6a0]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ContentSection>
      ))}

      <ContentSection
        eyebrow={<span role="img" aria-label="handshake">🤝</span>}
        title="Need to talk?"
        description="Questions about legal terms or billing? Reach out to our support team."
      >
        <div className="space-y-4">
          {supportChannels.map((channel) => (
            <div key={channel.title} className="rounded-3xl border-4 border-black bg-[#ffe8e8] px-5 py-4 shadow-[5px_5px_0_0_#000]">
              <h3 className="text-base font-extrabold uppercase tracking-[0.18em] text-black/80">{channel.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{channel.description}</p>
            </div>
          ))}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">Effective date: March 1, 2025</p>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
