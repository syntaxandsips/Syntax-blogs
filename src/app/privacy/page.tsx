import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const principles = [
  {
    title: 'Transparency',
    description: 'We explain why we collect data, how we use it, and the controls you have at every step.',
  },
  {
    title: 'Security',
    description: 'We secure data with encryption in transit and at rest, strict access policies, and regular audits.',
  },
  {
    title: 'Control',
    description: 'You can update preferences, export data, or request deletion at any time. We make it simple and fast.',
  },
];

const dataUsage = [
  {
    heading: 'What we collect',
    items: [
      'Account information such as name, email address, and authentication metadata.',
      'Product interaction data to improve recommendations and measure feature adoption.',
      'Support conversations and feedback that you voluntarily share with the team.',
    ],
  },
  {
    heading: 'How we use it',
    items: [
      'Deliver personalized content across blogs, podcasts, tutorials, and videos.',
      'Send transactional emails like login confirmations, subscription updates, and billing receipts.',
      'Diagnose issues, prevent abuse, and maintain the integrity of Syntax & Sips services.',
    ],
  },
  {
    heading: 'What we do not do',
    items: [
      'Sell or rent personal data to third parties.',
      'Use generative models to train on your private data without explicit consent.',
      'Ignore deletion requests—every request is processed within 7 days.',
    ],
  },
];

export const metadata = {
  title: 'Privacy Policy',
  description: 'Understand how Syntax & Sips collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Privacy policy"
      description="We built Syntax & Sips to be trustworthy by design. This policy outlines the data we collect, why we collect it, and the choices you can make."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="shield">🛡️</span>}
        title="Our principles"
        description="Three commitments guide every product decision."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <div key={principle.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{principle.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="document">📄</span>}
        title="How we handle your data"
        description="We only collect what we need to run Syntax & Sips. Here is the breakdown."
        fullWidth
      >
        <div className="space-y-6">
          {dataUsage.map((section) => (
            <section key={section.heading} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{section.heading}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span aria-hidden className="mt-1 text-[#6C63FF]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="gear">⚙️</span>}
        title="Your controls"
        description="You stay in control of your information."
        fullWidth
      >
        <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
          <li>
            <strong>Access & updates:</strong> Manage account settings anytime from your profile dashboard.
          </li>
          <li>
            <strong>Data export:</strong> Request a machine-readable export by emailing privacy@syntaxandsips.dev.
          </li>
          <li>
            <strong>Deletion:</strong> Delete your account in-app or contact support. We remove data from active systems within 7 days.
          </li>
        </ul>
        <p className="text-sm text-gray-600">Questions? Email us at privacy@syntaxandsips.dev.</p>
      </ContentSection>
    </ContentPageLayout>
  );
}
