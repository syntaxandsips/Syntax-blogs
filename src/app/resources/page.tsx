import { Metadata } from 'next';
import { FileText, FolderGit2, LayoutTemplate } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const availableResources = [
  {
    title: 'Documentation',
    description: 'Architecture notes, contribution guides, and editorial standards live in our docs folder.',
    href: '/docs/markdown-guide.md',
    icon: FileText,
  },
  {
    title: 'Blog library',
    description: 'Long-form posts break down the experiments and systems we are building in real time.',
    href: '/blogs',
    icon: LayoutTemplate,
  },
  {
    title: 'Changelog',
    description: 'Every release entry explains what shipped and why, serving as lightweight release notes.',
    href: '/changelog',
    icon: FolderGit2,
  },
];

const upcomingDrops = [
  'Template bundles for editorial planning, currently being reviewed for accuracy.',
  'Checklists for accessibility and publishing QA.',
  'Downloadable component inventories once the UI library stabilises.',
];

export const metadata: Metadata = {
  title: 'Resource hub status | Syntax & Sips',
  description:
    'The resource library is still being assembled. Explore the materials that exist today and see what is coming next.',
};

export default function ResourcesPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="In progress"
          title="Resource downloads are not live yet"
          description="We are still packaging the files. In the meantime, use these public references to follow our work."
          actions={
            <>
              <CtaButton href="/blogs">Read the latest posts</CtaButton>
              <CtaButton href="/newsletter" variant="secondary">
                Get notified when they drop
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Available today"
        title="Reference material you can use now"
        description="These links stay up-to-date as we continue building the platform."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {availableResources.map((resource) => (
            <article
              key={resource.title}
              className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-black/60">
                <resource.icon className="h-6 w-6 text-[#6C63FF]" aria-hidden="true" />
                {resource.title}
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{resource.description}</p>
              <CtaButton href={resource.href}>Open</CtaButton>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Packaging work"
        title="What we are still compiling"
        description="We will flip these live once we have verified each download."
        tone="lavender"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {upcomingDrops.map((item) => (
            <li
              key={item}
              className="rounded-2xl border-2 border-dashed border-black/30 bg-white/70 p-6 text-sm text-black/70"
            >
              {item}
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        eyebrow="Download shelf"
        title="Resource bundles"
        description="When the first packages are ready, download links will appear here."
        tone="peach"
      >
        {null}
      </ContentSection>
    </PageShell>
  );
}
