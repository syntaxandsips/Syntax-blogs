import { Metadata } from 'next';
import { CheckCircle2, Clock, Lightbulb } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const shipped = [
  {
    title: 'AI-assisted editing',
    description: 'Inline suggestions for tone, grammar, and code blocks directly inside the blog composer.',
    shippedAt: 'Shipped • February 2025',
  },
  {
    title: 'Real-time co-authoring',
    description: 'Invite collaborators to write, comment, and review posts together with presence indicators.',
    shippedAt: 'Shipped • January 2025',
  },
];

const inProgress = [
  {
    title: 'Creator analytics dashboard',
    description: 'Understand how readers interact with your content with retention curves, popular sections, and CTA performance.',
    eta: 'In progress • Targeting April 2025',
  },
  {
    title: 'Topic subscriptions',
    description: 'Let readers follow specific themes and receive personalized digests.',
    eta: 'In progress • Targeting May 2025',
  },
];

const exploring = [
  {
    title: 'Embedded learning labs',
    description: 'Interactive sandboxes that pair blog posts with runnable exercises and hints.',
    status: 'Exploring • Seeking beta testers',
  },
  {
    title: 'Mobile app',
    description: 'Offline reading, saved episodes, and push notifications tailored to your learning streaks.',
    status: 'Researching • Gathering feedback',
  },
];

export const metadata: Metadata = {
  title: 'Roadmap | Syntax & Sips',
  description: 'Track what the Syntax & Sips team is shipping next and share feedback that shapes our roadmap.',
};

export default function RoadmapPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Product Roadmap"
          title="Where Syntax & Sips is headed next"
          description="Peek behind the scenes at what we are exploring, building, and shipping based on your feedback."
          actions={
            <>
              <CtaButton href="/newsletter">Get roadmap updates</CtaButton>
              <CtaButton href="mailto:product@syntaxandsips.com" variant="secondary">
                Share feedback
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Just shipped"
        title="Highlights from the last release cycle"
        description="Recent updates inspired by community votes."
      >
        {shipped.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {shipped.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#4CAF50]" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">{item.shippedAt}</p>
                </div>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Building now"
        title="What we are actively working on"
        description="Timelines may shift based on testing and your feedback."
        tone="lavender"
      >
        {inProgress.length > 0 ? (
          <div className="grid gap-6">
            {inProgress.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-6 w-6 text-[#6C63FF]" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-black">{item.title}</h3>
                    <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">{item.eta}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Discovery"
        title="Ideas we are researching"
        description="Vote on experiments or volunteer to beta test so we can prioritize the next cycle."
        tone="peach"
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Have a suggestion? We review every note that lands in our inbox.</p>
            <CtaButton href="mailto:product@syntaxandsips.com" variant="secondary">
              Send an idea
            </CtaButton>
          </div>
        }
      >
        {exploring.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {exploring.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-6 w-6 text-[#FFB74D]" aria-hidden="true" />
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-black/60">{item.status}</p>
                </div>
                <h3 className="text-lg font-black">{item.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Your voice matters"
        title="Help us prioritize"
        description="We shape the roadmap with the community. Share your context so we can build what matters."
        align="center"
      >
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-black/80 max-w-2xl">
            Join quarterly feedback sessions or drop us a note with your biggest pain points. We reply to every message and
            invite select builders into private betas.
          </p>
          <CtaButton href="/newsletter" variant="secondary">
            Join feedback list
          </CtaButton>
        </div>
      </ContentSection>
    </PageShell>
  );
}
