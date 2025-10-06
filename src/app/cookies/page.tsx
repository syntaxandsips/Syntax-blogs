import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const categories = [
  {
    title: 'Essential cookies',
    description: 'Keep the site secure and operational. Required for authentication, session management, and load balancing.',
    examples: ['Session tokens', 'CSRF protection cookies', 'Traffic routing'],
  },
  {
    title: 'Analytics cookies',
    description: 'Help us understand how you use Syntax & Sips so we can make smarter improvements.',
    examples: ['Aggregate page views', 'Feature adoption metrics', 'Anonymized device info'],
  },
  {
    title: 'Preference cookies',
    description: 'Remember your theme, saved filters, and last-played content for a personalized experience.',
    examples: ['Theme selection', 'Saved category filters', 'Recently played podcasts'],
  },
];

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn how Syntax & Sips uses cookies and how you can manage your preferences.',
};

export default function CookiesPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Cookie policy"
      description="Cookies help us keep Syntax & Sips fast, secure, and tailored to you. Here is what we use and how you can take control."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="cookie">🍪</span>}
        title="Types of cookies"
        description="We keep our categories simple."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <article key={category.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{category.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{category.description}</p>
              <ul className="mt-3 space-y-1 text-xs font-semibold uppercase tracking-widest text-gray-600">
                {category.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="controls">🎛️</span>}
        title="Managing preferences"
        description="You can adjust analytics and preference cookies at any time."
        fullWidth
      >
        <div className="space-y-3 text-sm leading-relaxed text-gray-700">
          <p>
            Use the cookie banner to opt in or out of analytics. You can also clear cookies directly from your browser
            settings.
          </p>
          <p>
            Want a manual reset? Email privacy@syntaxandsips.dev and we will wipe non-essential cookies associated with your
            account.
          </p>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
