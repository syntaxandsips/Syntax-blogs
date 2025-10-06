import type { Metadata } from 'next';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const cookieHighlights = [
  {
    title: 'Stay signed in',
    description: 'Essential cookies keep sessions secure without requiring you to log in every time.',
  },
  {
    title: 'Improve performance',
    description: 'Anonymous analytics tell us what to optimize without tracking individual behavior.',
  },
  {
    title: 'Remember preferences',
    description: 'Accessibility settings, themes, and shortcuts follow you across devices.',
  },
];

const cookieCategories = [
  {
    title: 'Essential',
    items: [
      'Authentication tokens that keep you signed in and secure. Without them the product cannot function.',
      'Fraud prevention cookies that monitor suspicious activity to protect accounts.',
    ],
  },
  {
    title: 'Analytics',
    items: [
      'Session metrics that help us understand feature adoption and navigation flows.',
      'Aggregate performance data so we can troubleshoot latency or errors.',
    ],
  },
  {
    title: 'Preferences',
    items: [
      'Theme, language, and accessibility options that personalize the interface for you.',
      'Workspace layout settings that keep dashboards consistent across visits.',
    ],
  },
];

const managementSteps = [
  'Open the cookie banner or visit Settings → Privacy to review available categories.',
  'Toggle analytics or preference cookies anytime. Essential cookies remain active to keep the product secure.',
  'Save your changes. Updates sync across browsers when you are signed in.',
];

export const metadata: Metadata = {
  title: 'Cookie Policy | Syntax & Sips',
  description: 'Learn how Syntax & Sips uses cookies and how you can control your preferences.',
};

export default function CookiesPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Cookie policy"
      description="We use a small set of cookies to provide essential functionality and improve how the platform performs."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="cookie">🍪</span>}
        title="Why we use cookies"
        description="Cookies help us deliver secure sessions, remember your settings, and make better decisions with anonymized insights."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {cookieHighlights.map((highlight) => (
            <div key={highlight.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{highlight.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="folders">🗂️</span>}
        title="Types of cookies we set"
        description="Each category is purpose-driven and limited to what is necessary to provide value."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {cookieCategories.map((category) => (
            <div key={category.title} className="rounded-3xl border-4 border-black bg-[#f5f1ff] px-5 py-4 shadow-[5px_5px_0_0_#000]">
              <h3 className="text-base font-extrabold uppercase tracking-[0.18em] text-black/80">{category.title}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700">
                {category.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="text-[#ef476f]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="gear">⚙️</span>}
        title="Manage your preferences"
        description="You can adjust optional cookies at any time—your choices are respected immediately."
        fullWidth
      >
        <ol className="space-y-3 text-sm leading-relaxed text-gray-700">
          {managementSteps.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-3xl border-2 border-dashed border-black/30 bg-white px-4 py-3">
              <span className="font-semibold text-black">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="information">ℹ️</span>}
        title="Need more information?"
        description="If you have questions about cookies or tracking technologies, our support team can help."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-gray-700">
            Email <a className="font-semibold underline" href="mailto:privacy@syntaxandsips.com">privacy@syntaxandsips.com</a> or adjust your settings anytime in the app.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">Last updated: March 1, 2025</p>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
