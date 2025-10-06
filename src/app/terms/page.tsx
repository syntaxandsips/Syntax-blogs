import Link from 'next/link';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const commitments = [
  {
    title: 'Respectful community',
    description: 'We foster a space where curiosity is welcome and harassment is not. Behave professionally across comments, DMs, and events.',
  },
  {
    title: 'Responsible usage',
    description: 'Use Syntax & Sips content and tooling in lawful ways. No scraping, spam, or attempts to exploit vulnerabilities.',
  },
  {
    title: 'Attribution matters',
    description: 'Share freely, but keep credits intact. Cite Syntax & Sips when you republish insights, code snippets, or frameworks.',
  },
];

const sections = [
  {
    heading: 'Accounts',
    body: [
      'Provide accurate information and keep your credentials secure. You are responsible for all activity on your account.',
      'Notify us immediately if you suspect unauthorized use. We may suspend accounts that appear compromised.',
    ],
  },
  {
    heading: 'Content & licensing',
    body: [
      'Original content is owned by Syntax & Sips. You may reference it with attribution, but you cannot resell or misrepresent it as your own.',
      'Community contributions remain yours, but you grant Syntax & Sips a non-exclusive license to display and promote them.',
    ],
  },
  {
    heading: 'Termination',
    body: [
      'We reserve the right to suspend or terminate accounts that violate these terms or pose a security risk.',
      'You may cancel anytime. Deleting your account removes access to subscriber-only resources.',
    ],
  },
];

export const metadata = {
  title: 'Terms of Service',
  description: 'Review the rules and expectations for using Syntax & Sips products.',
};

export default function TermsPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Terms of service"
      description="We built these guidelines to keep the Syntax & Sips community respectful, secure, and enjoyable for everyone."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="handshake">🤝</span>}
        title="Our commitments"
        description="These pillars shape how we run Syntax & Sips."
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

      <ContentSection
        eyebrow={<span role="img" aria-label="scales">⚖️</span>}
        title="Key policies"
        description="By using Syntax & Sips you agree to the following terms."
        fullWidth
      >
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.heading} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{section.heading}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                {section.body.map((paragraph) => (
                  <li key={paragraph} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1 text-[#FF5252]">•</span>
                    <span>{paragraph}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="megaphone">📣</span>}
        title="Need clarification?"
        description="Reach out if something is unclear."
        fullWidth
      >
        <p className="text-sm leading-relaxed text-gray-700">
          Email legal@syntaxandsips.dev and we will respond within two business days. You can also review our
          <Link href="/privacy" className="underline"> privacy policy</Link> for additional detail.
        </p>
      </ContentSection>
    </ContentPageLayout>
  );
}
