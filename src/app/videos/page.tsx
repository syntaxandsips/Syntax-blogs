import { Metadata } from 'next';
import { Camera, Film, Newspaper } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const currentFormats = [
  {
    title: 'Blog walkthroughs',
    description: 'Detailed articles with screenshots and code snippets cover the same concepts we plan to film.',
    href: '/blogs',
    icon: Newspaper,
  },
  {
    title: 'Changelog demos',
    description: 'Release notes include short Loom-style clips while we build the full video pipeline.',
    href: '/changelog',
    icon: Camera,
  },
];

const productionTodo = [
  'Standardising recording templates for screen capture and voice-over.',
  'Setting up accessible captioning and transcript tooling.',
  'Automating thumbnail generation and metadata publishing.',
];

export const metadata: Metadata = {
  title: 'Video hub status | Syntax & Sips',
  description:
    'Our video library is still under construction. Follow the honest progress report and see what you can watch today.',
};

export default function VideosPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Coming soon"
          title="No video lessons yet—here is the plan"
          description="We are actively building the recording workflow. Until the library is live, use these resources to stay in the loop."
          actions={
            <>
              <CtaButton href="/blogs">Read the latest guides</CtaButton>
              <CtaButton href="/newsletter" variant="secondary">
                Get launch updates
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Watch something now"
        title="Existing content"
        description="These formats are available today while we finish the full studio workflow."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {currentFormats.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-black/60">
                <item.icon className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
                {item.title}
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
              <CtaButton href={item.href}>Open</CtaButton>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Production board"
        title="Steps before we hit record"
        description="This to-do list guides the launch of the video library."
        tone="lavender"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {productionTodo.map((task) => (
            <li
              key={task}
              className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-black/30 bg-white/70 p-6 text-sm text-black/70"
            >
              <Film className="mt-0.5 h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        eyebrow="Future playlists"
        title="Video library"
        description="Once the first episodes publish, the full catalogue will live here."
        tone="peach"
      >
        {null}
      </ContentSection>
    </PageShell>
  );
}
