import { Metadata } from 'next';
import { FileSignature, Handshake, Scale } from 'lucide-react';
import { PageShell, PageHero, ContentSection } from '@/components/ui/PageLayout';

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

export const metadata: Metadata = {
  title: 'Terms of Service | Syntax & Sips',
  description: 'Review the legal terms that govern your use of Syntax & Sips products and services.',
};

export default function TermsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Terms"
          title="The agreement between you and Syntax & Sips"
          description="We aim for clarity in how we operate. These terms are designed to protect both you and our community."
        />
      }
    >
      <ContentSection
        eyebrow="Our commitments"
        title="What you can expect from us"
        description="We strive to keep the platform reliable, secure, and inclusive."
        tone="lavender"
        align="center"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Scale className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
            <h3 className="text-lg font-black">Fairness</h3>
            <p className="text-sm text-black/70">
              We enforce our policies consistently and evaluate changes with transparency.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Handshake className="h-10 w-10 text-[#FF5252]" aria-hidden="true" />
            <h3 className="text-lg font-black">Partnership</h3>
            <p className="text-sm text-black/70">
              We will communicate changes ahead of time and seek feedback before major updates.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <FileSignature className="h-10 w-10 text-[#4CAF50]" aria-hidden="true" />
            <h3 className="text-lg font-black">Clarity</h3>
            <p className="text-sm text-black/70">
              Our documentation, pricing, and policies are written in plain language—no jargon.
            </p>
          </div>
        </div>
      </ContentSection>

      {termsSections.map((section) => (
        <ContentSection key={section.title} title={section.title} description={section.description}>
          <ul className="space-y-3">
            {section.bullets.map((item) => (
              <li
                key={item}
                className="rounded-2xl border-2 border-dashed border-black/30 bg-white/70 px-4 py-3 text-sm text-black/80"
              >
                {item}
              </li>
            ))}
          </ul>
        </ContentSection>
      ))}

      <ContentSection
        eyebrow="Need to talk?"
        title="We are here to help"
        description="Questions about legal terms or billing? Reach out to our support team."
        align="center"
      >
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-black/70">
            Contact legal@syntaxandsips.com or start a conversation from the in-app support widget.
          </p>
          <p className="text-sm font-semibold text-black">Effective date: March 1, 2025</p>
        </div>
      </ContentSection>
    </PageShell>
  );
}
