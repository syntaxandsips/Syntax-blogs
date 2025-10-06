import { Metadata } from 'next';
import { ShieldCheck, UserCheck, Database } from 'lucide-react';
import { PageShell, PageHero, ContentSection } from '@/components/ui/PageLayout';

const privacySections = [
  {
    title: 'Information we collect',
    description: 'We gather the minimum data required to deliver a personalized experience and improve our products.',
    bullets: [
      'Account details you share when signing up—name, email, and profile preferences.',
      'Content metadata like drafts, publication timestamps, and engagement metrics.',
      'Technical diagnostics such as browser information and anonymized usage analytics.',
    ],
  },
  {
    title: 'How we use your data',
    description: 'Your information powers the features you rely on and helps us respond to issues quickly.',
    bullets: [
      'Authenticating your account and syncing data across devices.',
      'Sending product updates, newsletters, and transactional emails you opt into.',
      'Monitoring performance, preventing abuse, and improving accessibility.',
    ],
  },
  {
    title: 'Your choices and controls',
    description: 'You stay in control of what you share and how we communicate with you.',
    bullets: [
      'Update your preferences or delete your account at any time from your profile settings.',
      'Request a copy of your data or ask us to export it in a portable format.',
      'Opt out of marketing emails with a single click—transactional emails will still be delivered when necessary.',
    ],
  },
];

export const metadata: Metadata = {
  title: 'Privacy Policy | Syntax & Sips',
  description: 'Understand how Syntax & Sips collects, uses, and protects your data across our platform and services.',
};

export default function PrivacyPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Privacy"
          title="We respect your craft and your privacy"
          description="Transparency is part of our culture. This policy explains what we collect, why we collect it, and how you stay in control."
        />
      }
    >
      <ContentSection
        eyebrow="Our principles"
        title="We built Syntax & Sips with privacy at the center"
        description="We only collect what we need, we secure what we store, and we never sell your data."
        tone="peach"
        align="center"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <ShieldCheck className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
            <h3 className="text-lg font-black">Security-first</h3>
            <p className="text-sm text-black/70">
              Encryption in transit and at rest, strict access controls, and continuous monitoring keep your work protected.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <UserCheck className="h-10 w-10 text-[#FF5252]" aria-hidden="true" />
            <h3 className="text-lg font-black">You stay in control</h3>
            <p className="text-sm text-black/70">
              We provide clear settings so you choose what to share, how long we keep it, and how we contact you.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Database className="h-10 w-10 text-[#4CAF50]" aria-hidden="true" />
            <h3 className="text-lg font-black">Purposeful data</h3>
            <p className="text-sm text-black/70">
              We only store the information required to deliver your experience and we regularly purge stale records.
            </p>
          </div>
        </div>
      </ContentSection>

      {privacySections.map((section) => (
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
        eyebrow="Questions"
        title="Need more details?"
        description="Reach out and we will walk you through our privacy practices or update this policy based on your feedback."
        align="center"
      >
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <p className="text-sm text-black/70">
            Email privacy@syntaxandsips.com or contact us from your account dashboard. We respond to every request within 72 hours.
          </p>
          <p className="text-sm font-semibold text-black">Last updated: March 1, 2025</p>
        </div>
      </ContentSection>
    </PageShell>
  );
}
