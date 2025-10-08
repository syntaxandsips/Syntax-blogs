import { Metadata } from 'next';
import { Bell, Clock3, Info } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const newsletterHighlights = [
  {
    title: 'Product updates',
    description: 'We email when new features ship or the roadmap changes—no weekly filler.',
    icon: Bell,
  },
  {
    title: 'Behind-the-scenes notes',
    description: 'Expect honest build logs and lessons learned while the platform is in progress.',
    icon: Info,
  },
  {
    title: 'Occasional deep dives',
    description: 'When we publish a major guide, we send one follow-up with extra context and resources.',
    icon: Clock3,
  },
];

export const metadata: Metadata = {
  title: 'Newsletter status | Syntax & Sips',
  description:
    'We are collecting interest for the Syntax & Sips newsletter. Here is exactly what to expect and what does not exist yet.',
};

export default function NewsletterPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Slow inbox"
          title="No weekly newsletter yet"
          description="We send updates only when something meaningful ships. Join the list below and we will email you once there is real news to share."
          actions={
            <>
              <CtaButton href="/#newsletter">Join from the homepage</CtaButton>
              <CtaButton href="/blogs" variant="secondary">
                Read the latest instead
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="What we send"
        title="A practical update when it matters"
        description="No automated cadence. You will only hear from us when there is something tangible to show."
        tone="peach"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {newsletterHighlights.map((item) => (
            <article
              key={item.title}
              className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
            >
              <item.icon className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
              <h3 className="text-lg font-black">{item.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Current state"
        title="Archive and automation"
        description="There is no archive yet. When the first issue is ready it will appear here with a public link."
        tone="lavender"
      >
        {null}
      </ContentSection>

      <ContentSection
        eyebrow="Stay connected"
        title="Prefer RSS or social updates?"
        description="Follow the blog or changelog today and you will not miss anything while the newsletter is quiet."
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">You can unsubscribe from emails in one click whenever we start sending them.</p>
            <CtaButton href="/changelog" variant="secondary">
              View the changelog
            </CtaButton>
          </div>
        }
      >
        <div className="rounded-2xl border-2 border-black bg-white/70 p-6 text-sm text-black/70 leading-relaxed">
          <p>
            We are still validating the right format and cadence. Until that is settled we will not send regular mail. Signing up now simply tells us you would like a heads-up once the first issue exists.
          </p>
        </div>
      </ContentSection>
    </PageShell>
  );
}
