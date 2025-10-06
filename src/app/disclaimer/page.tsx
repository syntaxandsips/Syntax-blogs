import { Metadata } from 'next';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { PageShell, PageHero, ContentSection } from '@/components/ui/PageLayout';

const disclaimerPoints = [
  {
    title: 'Educational intent',
    description: 'Content is for educational purposes only and should not be interpreted as professional advice for your specific situation.',
  },
  {
    title: 'Your responsibility',
    description: 'You are responsible for validating strategies, running tests, and ensuring your implementation meets regulatory requirements.',
  },
  {
    title: 'Evolving platforms',
    description: 'The web changes quickly. Framework APIs and best practices can shift between the time an article is published and when you read it.',
  },
];

const contactNotes = [
  'If you notice an inaccuracy or outdated recommendation, contact us so we can address it quickly.',
  'For legal, security, or compliance-specific guidance, consult with a qualified professional.',
];

export const metadata: Metadata = {
  title: 'Disclaimer | Syntax & Sips',
  description: 'Understand the limits of the guidance we publish and how to request clarifications.',
};

export default function DisclaimerPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Disclaimer"
          title="What to know before you put our ideas to work"
          description="We share best practices learned from the community, but you should always tailor advice to your team and constraints."
        />
      }
    >
      <ContentSection
        eyebrow="Read this first"
        title="No guarantees, only guidance"
        description="We publish strategies that have worked for us and our collaborators. You are responsible for evaluating what fits your context."
        tone="peach"
        align="center"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <Info className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
            <h3 className="text-lg font-black">Context matters</h3>
            <p className="text-sm text-black/70">Use the material as inspiration and validate it against your architecture, audience, and policies.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-[#FF5252]" aria-hidden="true" />
            <h3 className="text-lg font-black">Test before launch</h3>
            <p className="text-sm text-black/70">Always test in staging, follow QA best practices, and measure the impact of every change.</p>
          </div>
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center">
            <ShieldAlert className="h-10 w-10 text-[#4CAF50]" aria-hidden="true" />
            <h3 className="text-lg font-black">Stay compliant</h3>
            <p className="text-sm text-black/70">Review regulations and organizational policies before rolling out any recommendation to production.</p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Key considerations" description="Keep these points in mind whenever you apply a tutorial or template.">
        <div className="grid gap-4 md:grid-cols-3">
          {disclaimerPoints.map((point) => (
            <article
              key={point.title}
              className="flex h-full flex-col gap-3 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <h3 className="text-lg font-black">{point.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{point.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Questions"
        title="We want to hear from you"
        description="Our content improves every time the community shares feedback or new insights."
        align="center"
      >
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="space-y-3 text-sm text-black/70">
            {contactNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
          <p className="text-sm font-semibold text-black">Last reviewed: March 1, 2025</p>
        </div>
      </ContentSection>
    </PageShell>
  );
}
