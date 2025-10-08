import { Metadata } from 'next';
import { ArrowRight, BellRing, Coffee, NotebookPen } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const newsletterPerks = [
  {
    title: 'Actionable playbooks',
    description: 'Each issue includes frameworks and templates you can copy-paste into your own workflow the same day.',
    icon: NotebookPen,
  },
  {
    title: 'Shipping inspiration',
    description: 'Peek inside real teams as they scale products, run retros, and iterate with empathy.',
    icon: Coffee,
  },
  {
    title: 'Community spotlights',
    description: 'We feature wins, experiments, and open-source launches from readers around the globe.',
    icon: BellRing,
  },
];

const subscriptionSteps = [
  {
    step: 'Step 01',
    title: 'Sign up with your best email',
    description: 'No spam—just one thoughtful edition in your inbox every Friday morning.',
  },
  {
    step: 'Step 02',
    title: 'Choose your focus',
    description: 'Let us know what you care about most so we can tailor bonus resources to your goals.',
  },
  {
    step: 'Step 03',
    title: 'Ship something new',
    description: 'Every email ends with a challenge or prompt to help you apply what you learned immediately.',
  },
];

const recentIssues = [
  {
    title: 'Issue #42: Calm velocity',
    summary: 'How high-performing teams sustain delivery without burning out, plus a meeting audit checklist.',
  },
  {
    title: 'Issue #41: DX like a product',
    summary: 'Treat your developer experience like a roadmap—prioritize, measure, and celebrate wins.',
  },
  {
    title: 'Issue #40: Debugging rituals',
    summary: 'Three debugging stories from the community and the tactics that kept incidents calm.',
  },
];

export const metadata: Metadata = {
  title: 'Newsletter | Syntax & Sips',
  description: 'Join the Syntax & Sips newsletter for curated insights, playbooks, and community highlights every Friday.',
};

export default function NewsletterPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Weekly Delivery"
          title="A letter for builders who care about craft"
          description="Get one thoughtful dispatch every Friday with tactics, templates, and stories from the Syntax & Sips community."
          actions={
            <>
              <CtaButton href="https://syntaxandsips.com/newsletter" target="_blank" rel="noreferrer">
                Subscribe free
              </CtaButton>
              <CtaButton href="/resources" variant="secondary">
                Preview resources
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Why join"
        title="A newsletter you will actually finish"
        description="We respect your time. Every edition is concise, practical, and designed to help you take the next step."
        tone="peach"
        align="center"
      >
        {newsletterPerks.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {newsletterPerks.map((perk) => (
              <article
                key={perk.title}
                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
              >
                <perk.icon className="h-12 w-12 text-[#6C63FF]" aria-hidden="true" />
                <h3 className="text-lg font-black">{perk.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{perk.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="How it works"
        title="Set up in minutes"
        description="We only ask for the essentials so you can start receiving insights right away."
        tone="lavender"
      >
        {subscriptionSteps.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {subscriptionSteps.map((step) => (
              <article
                key={step.step}
                className="flex h-full flex-col gap-3 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF5252]">{step.step}</p>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{step.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Fresh off the press"
        title="Recent issues"
        description="Catch up on the latest editions and see if our style fits how you learn."
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Prefer RSS? You can also read every issue on the site.</p>
            <CtaButton href="/blogs" variant="secondary">
              Browse the archive
            </CtaButton>
          </div>
        }
      >
        {recentIssues.length > 0 ? (
          <div className="grid gap-4">
            {recentIssues.map((issue) => (
              <article
                key={issue.title}
                className="flex flex-col gap-2 rounded-2xl border-2 border-black bg-white/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-lg font-black">{issue.title}</h3>
                  <p className="text-sm text-black/70 leading-relaxed">{issue.summary}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-[#6C63FF]" aria-hidden="true" />
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Questions?"
        title="We keep things personal"
        description="Reply to any email and a real human from the Syntax & Sips crew will get back to you."
        align="center"
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-black">Email us anytime</h3>
            <p className="text-sm text-black/70">
              We love feedback, story ideas, and learning about the ways you are leveling up your craft.
            </p>
          </div>
          <CtaButton href="mailto:hello@syntaxandsips.com" variant="secondary">
            Say hello
          </CtaButton>
        </div>
      </ContentSection>
    </PageShell>
  );
}
