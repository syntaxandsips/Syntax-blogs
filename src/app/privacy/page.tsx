import type { Metadata } from 'next';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const privacyPrinciples = [
  {
    title: 'Security first',
    description: 'Encryption in transit and at rest, role-based access controls, and regular audits keep your projects protected.',
  },
  {
    title: 'Choice by default',
    description: 'Clear settings let you decide what to share, how long we keep it, and which messages you receive.',
  },
  {
    title: 'Purpose-driven data',
    description: 'We only store the information required to deliver Syntax & Sips and continuously purge stale records.',
  },
];

const privacySections = [
  {
    title: 'Information we collect',
    description: 'We gather the minimum data required to deliver a personalized experience and improve our products.',
    bullets: [
      'Account details you share when signing up—name, email, profile preferences, and age confirmation.',
      'Content metadata like drafts, publication timestamps, engagement metrics, and voluntary gamification actions.',
      'Technical diagnostics such as browser information and anonymized usage analytics.',
    ],
  },
  {
    title: 'How we use your data',
    description: 'Your information powers the features you rely on and helps us respond to issues quickly.',
    bullets: [
      'Authenticating your account and syncing data across devices.',
      'Awarding points, levels, and badges when you opt into gamification—complete with transparent ledgers and audit logs.',
      'Sending product updates, newsletters, and transactional emails you opt into.',
      'Monitoring performance, preventing abuse, and improving accessibility.',
    ],
  },
  {
    title: 'Your choices and controls',
    description: 'You stay in control of what you share and how we communicate with you.',
    bullets: [
      'Update your preferences or delete your account at any time from your profile settings.',
      'Toggle gamification participation, leaderboard visibility, and notification preferences independently.',
      'Request a copy of your data or ask us to export it in a portable format.',
      'Opt out of marketing emails with a single click—transactional emails will still be delivered when necessary.',
    ],
  },
];

const requestOptions = [
  {
    title: 'Access & portability',
    description: 'Generate a copy of your data or request exports in interoperable formats right from account settings.',
  },
  {
    title: 'Correction & deletion',
    description: 'Update profile fields anytime, or ask us to delete content when you are ready to move on.',
  },
  {
    title: 'Objection & restriction',
    description: 'If you need us to pause certain processing activities, our privacy team responds within 72 hours.',
  },
];

export const metadata: Metadata = {
  title: 'Privacy Policy | Syntax & Sips',
  description: 'Understand how Syntax & Sips collects, uses, and protects your data across our platform and services.',
};

export default function PrivacyPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Privacy policy"
      description="Transparency is part of our culture. This policy explains what we collect, why we collect it, and how you stay in control."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="shield">🛡️</span>}
        title="Our privacy principles"
        description="We designed Syntax & Sips to respect your work and your data from day one."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {privacyPrinciples.map((principle) => (
            <div key={principle.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{principle.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      {privacySections.map((section) => (
        <ContentSection
          key={section.title}
          eyebrow={<span role="img" aria-label="folder">🗂️</span>}
          title={section.title}
          description={section.description}
        >
          <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
            {section.bullets.map((item) => (
              <li key={item} className="flex gap-3 rounded-3xl border-2 border-dashed border-black/30 bg-white px-4 py-3">
                <span aria-hidden className="font-bold text-[#ef476f]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ContentSection>
      ))}

      <ContentSection
        eyebrow={<span role="img" aria-label="controls">🎛️</span>}
        title="Requesting changes"
        description="Tell us how you want your information handled and we will make it happen."
        fullWidth
      >
        <div className="grid gap-4 md:grid-cols-3">
          {requestOptions.map((option) => (
            <div key={option.title} className="rounded-3xl border-4 border-black bg-[#f5f1ff] px-5 py-4 shadow-[5px_5px_0_0_#000]">
              <h3 className="text-base font-extrabold uppercase tracking-[0.18em] text-black/80">{option.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{option.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="trophy">🏆</span>}
        title="Gamification transparency"
        description="Participation in Syntax &amp; Sips quests, streaks, and badges is optional. Your opt-in status, XP totals, and badge collection are visible only to you and admins unless you enable public showcases."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-gray-700">
            You can download or delete your gamification data from account settings. Seasonal leaderboards store pseudonymised IDs and expire after 90 days. Manual adjustments are tracked in our immutable audit log.
          </p>
          <p className="text-sm leading-relaxed text-gray-700">
            Questions about gamification privacy? Email <a className="font-semibold underline" href="mailto:privacy@syntaxandsips.com">privacy@syntaxandsips.com</a> and reference the gamification DPIA for a same-week response.
          </p>
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="envelope">✉️</span>}
        title="Need more details?"
        description="Reach out and we will walk you through our privacy practices or update this policy based on your feedback."
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-gray-700">
            Email <a className="font-semibold underline" href="mailto:privacy@syntaxandsips.com">privacy@syntaxandsips.com</a> or contact us from your account dashboard. We respond to every request within 72 hours.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">Last updated: March 18, 2025</p>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
