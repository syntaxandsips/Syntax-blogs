import { Metadata } from 'next';
import { Mic, NotebookPen } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const availableResources = [
  {
    title: 'Read the build log',
    description:
      'We document our progress in long-form articles while we learn what format the podcast should take.',
    href: '/blogs',
  },
  {
    title: 'Follow the changelog',
    description: 'Every time we ship a notable update we capture it in the public changelog.',
    href: '/changelog',
  },
];

const preparationSteps = [
  {
    title: 'Recording workflow',
    description: 'Dialing in the equipment, editing pipeline, and publishing checklist so episodes ship consistently.',
  },
  {
    title: 'Story backlog',
    description: 'Collecting questions and topic requests from the community before we hit record.',
  },
  {
    title: 'Distribution plan',
    description: 'Testing hosting providers and RSS tooling to make sure subscribing will be painless on day one.',
  },
];

export const metadata: Metadata = {
  title: 'Podcasts status | Syntax & Sips',
  description:
    'Get an honest update on the Syntax & Sips podcast roadmap. No episodes are live yet—we are still preparing the format.',
};

export default function PodcastsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="In development"
          title="Podcasts are still in pre-production"
          description="We have not released any audio episodes yet. This page explains what we are working on and how to follow along."
          actions={
            <>
              <CtaButton href="/blogs">Read the latest updates</CtaButton>
              <CtaButton href="/newsletter" variant="secondary">
                Join the interest list
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="What exists today"
        title="You can still follow the work in progress"
        description="While the podcast feed is empty, these resources cover the same themes we plan to explore on mic."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {availableResources.map((resource) => (
            <article
              key={resource.title}
              className="flex h-full flex-col justify-between gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/60">
                <NotebookPen className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                {resource.title}
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{resource.description}</p>
              <CtaButton href={resource.href}>Open</CtaButton>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="What we are tackling"
        title="Pre-production checklist"
        description="Here is the honest list of tasks we are wrapping up before episode one ships."
        tone="lavender"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {preparationSteps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-black/30 bg-white/70 p-6"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[#6C63FF]">
                <Mic className="h-4 w-4" aria-hidden="true" />
                In progress
              </div>
              <h3 className="text-lg font-black text-black">{step.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{step.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Where updates will land"
        title="Stay in the loop"
        description="We will announce the feed, guests, and schedule the moment everything is ready."
        tone="peach"
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">
              Prefer RSS? We will publish the feed URL here first once recording begins.
            </p>
            <CtaButton href="/newsletter" variant="secondary">
              Get notified
            </CtaButton>
          </div>
        }
      >
        <div className="rounded-2xl border-2 border-black bg-white/70 p-6 text-sm text-black/70 leading-relaxed">
          <p>
            No teaser clips, transcripts, or subscription links exist yet. When those are ready this section will list them—until
            then, the best place for updates is our newsletter or the changelog.
          </p>
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Launch details"
        title="Podcast feed"
        description="As soon as the podcast is published, you will see links here."
      >
        {null}
      </ContentSection>
    </PageShell>
  );
}
