import { Metadata } from 'next';
import { Briefcase, FolderGit2, GraduationCap, Library, Newspaper } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const resourceCollections = [
  {
    title: 'Starter templates',
    description: 'Opinionated boilerplates for Next.js, Remix, and Astro with testing, linting, and deployment ready to go.',
    icon: FolderGit2,
    linkLabel: 'View templates',
    href: '/docs',
  },
  {
    title: 'Team playbooks',
    description: 'Download battle-tested rituals, meeting cadences, and handoff docs to keep cross-functional teams aligned.',
    icon: Briefcase,
    linkLabel: 'Run the play',
    href: '/blogs',
  },
  {
    title: 'Learning paths',
    description: 'Step-by-step curriculum recommendations to go from fundamentals to advanced topics without burning out.',
    icon: GraduationCap,
    linkLabel: 'Choose a path',
    href: '/tutorials',
  },
];

const guides = [
  'Accessibility checklists and inclusive design patterns for every component.',
  'Incident response handbook for small teams shipping on-call rotations.',
  'Community templates for writing effective RFCs and architecture docs.',
  'Workshop kits including slide decks, facilitation notes, and recap templates.',
];

const newsletterHighlights = [
  {
    title: 'The Ship Log',
    description: 'Weekly summary of product releases, developer experience wins, and roadmap updates.',
  },
  {
    title: 'Friday Debug',
    description: 'A tactical teardown of one tricky issue and how a community member solved it.',
  },
  {
    title: 'Culture Code',
    description: 'Stories, rituals, and experiments from teams building healthy engineering cultures.',
  },
];

export const metadata: Metadata = {
  title: 'Resource Library | Syntax & Sips',
  description: 'Download templates, guides, and curated resources to support your developer workflow from idea to launch.',
};

export default function ResourcesPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Resource Library"
          title="Tools, templates, and guides to accelerate your workflow"
          description="Save hours of busywork with curated resources crafted by our team and community contributors."
          actions={
            <>
              <CtaButton href="/newsletter">Get resource drops</CtaButton>
              <CtaButton href="/podcasts" variant="secondary">
                Hear how teams use them
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Collections"
        title="Curated libraries for builders"
        description="Every download comes with context, setup instructions, and recommended next steps."
      >
        {resourceCollections.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {resourceCollections.map((collection) => (
              <article
                key={collection.title}
                className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <collection.icon className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
                <h3 className="text-xl font-black">{collection.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{collection.description}</p>
                <CtaButton href={collection.href}>{collection.linkLabel}</CtaButton>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Guides & toolkits"
        title="What you can download today"
        description="We keep everything updated as frameworks evolve, so you always grab the latest version."
        tone="lavender"
      >
        {guides.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <li
                key={guide}
                className="flex items-start gap-4 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6"
              >
                <Library className="mt-1 h-8 w-8 text-[#FF5252]" aria-hidden="true" />
                <p className="text-sm text-black/80 leading-relaxed">{guide}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Newsletter extras"
        title="Premium resources delivered on Fridays"
        description="Subscribers get bonus checklists, partner discounts, and behind-the-scenes case studies."
        tone="peach"
        align="center"
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Unlock access by joining the Syntax & Sips newsletter community.</p>
            <CtaButton href="/newsletter">Subscribe now</CtaButton>
          </div>
        }
      >
        {newsletterHighlights.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {newsletterHighlights.map((highlight) => (
              <article
                key={highlight.title}
                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
              >
                <Newspaper className="h-12 w-12 text-[#FF5252]" aria-hidden="true" />
                <h3 className="text-lg font-black">{highlight.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{highlight.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>
    </PageShell>
  );
}
