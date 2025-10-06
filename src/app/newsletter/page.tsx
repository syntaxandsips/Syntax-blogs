import Link from 'next/link';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';
import { NewsletterSection } from '@/components/ui/NewsletterSection';

const perks = [
  {
    title: 'AI trends decoded',
    description: 'Every Friday we share a curated briefing on the AI news that actually matters for builders.',
  },
  {
    title: 'Implementation walkthroughs',
    description: 'Step-by-step breakdowns of features we ship on Syntax & Sips—complete with repo links and diagrams.',
  },
  {
    title: 'Templates & tooling alerts',
    description: 'Be the first to access new prompts, dashboards, and productivity automations from the team.',
  },
];

const commitment = [
  'No spam—ever. We send 1 primary email per week and occasional launch notes.',
  'You can unsubscribe in a single click. Every email includes a plain-text link.',
  'We protect your data. Read the privacy policy for full details.',
];

export const metadata = {
  title: 'Newsletter',
  description: 'Join thousands of builders receiving actionable AI insights from Syntax & Sips each week.',
};

export default function NewsletterPage() {
  return (
    <ContentPageLayout
      badge={<span>Stay Updated</span>}
      title="Subscribe to the Syntax & Sips newsletter"
      description="Get weekly insights, implementation guides, and behind-the-scenes updates. We keep it practical, tactical, and easy to apply."
      action={
        <Link href="#signup" className="neo-button bg-black text-white px-5 py-3 text-sm md:text-base">
          Jump to signup
        </Link>
      }
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="mailbox">📬</span>}
        title="Why readers stay subscribed"
        description="We respect your inbox. Each issue is written by our core team and includes concrete takeaways."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {perks.map((perk) => (
            <div key={perk.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{perk.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{perk.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="shield">🛡️</span>}
        title="Our promise"
        description="We built guardrails so you can trust every email."
        fullWidth
      >
        <ul className="space-y-3 text-sm font-semibold leading-relaxed text-gray-800">
          {commitment.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-[#6C63FF]">✔</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600">
          Curious how we handle data? Review our <Link href="/privacy" className="underline">privacy policy</Link> and
          <Link href="/terms" className="underline"> terms of service</Link>.
        </p>
      </ContentSection>

      <div id="signup">
        <NewsletterSection />
      </div>
    </ContentPageLayout>
  );
}
