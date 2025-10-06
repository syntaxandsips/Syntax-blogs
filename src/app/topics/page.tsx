import { Metadata } from 'next';
import { Globe2, Layers, PlugZap, Sparkles } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const topics = [
  {
    title: 'Frontend & UI',
    description: 'Design systems, animation, accessibility, and the craft of building delightful interfaces.',
    icon: Layers,
    spotlight: ['Design tokens', 'Accessibility audits', 'Framer Motion', 'CSS architecture'],
  },
  {
    title: 'Full-stack & APIs',
    description: 'Server components, edge computing, GraphQL, and resilient backend patterns.',
    icon: PlugZap,
    spotlight: ['Edge functions', 'Supabase workflows', 'tRPC', 'Caching strategies'],
  },
  {
    title: 'Tooling & DX',
    description: 'Developer experience, testing, observability, and workflows that keep teams shipping happily.',
    icon: Sparkles,
    spotlight: ['Playwright testing', 'CI/CD pipelines', 'Telemetry', 'Dev productivity'],
  },
  {
    title: 'Culture & careers',
    description: 'Leadership, collaboration, growth frameworks, and stories from the people behind the products.',
    icon: Globe2,
    spotlight: ['Engineering management', 'Career ladders', 'Async collaboration', 'Team rituals'],
  },
];

const curatedCollections = [
  {
    title: 'Launch Playbook',
    description: 'Everything you need to go from concept to shipped product with real-world constraints in mind.',
    href: '/resources',
  },
  {
    title: 'Accessibility Toolkit',
    description: 'Guides, checklists, and code labs to make inclusive experiences the default.',
    href: '/blogs',
  },
  {
    title: 'Career Growth Series',
    description: 'Stories and frameworks for leveling up as an individual contributor or manager.',
    href: '/blogs',
  },
];

export const metadata: Metadata = {
  title: 'Topics | Syntax & Sips',
  description: 'Browse the topics we cover across blogs, podcasts, and tutorials to find what you want to learn next.',
};

export default function TopicsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Topics"
          title="Follow the subjects that keep you curious"
          description="Pick a lane—or mix a few. Syntax & Sips covers the full spectrum of building delightful, resilient products."
          actions={
            <>
              <CtaButton href="/newsletter">Subscribe for highlights</CtaButton>
              <CtaButton href="/blogs" variant="secondary">
                Read the latest
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Categories"
        title="A little something for every builder"
        description="Dive deep into a single topic or explore cross-disciplinary insights that make teams unstoppable."
      >
        <div className="grid gap-8 md:grid-cols-2">
          {topics.map((topic) => (
            <article
              key={topic.title}
              className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3">
                <topic.icon className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
                <h3 className="text-xl font-black">{topic.title}</h3>
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{topic.description}</p>
              <div className="flex flex-wrap gap-2">
                {topic.spotlight.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Curated collections"
        title="Not sure where to start?"
        description="These playlists bundle our best content so you can binge with purpose."
        tone="lavender"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {curatedCollections.map((collection) => (
            <article
              key={collection.title}
              className="flex h-full flex-col gap-3 rounded-2xl border-2 border-black bg-white/80 p-6"
            >
              <h3 className="text-lg font-black">{collection.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{collection.description}</p>
              <CtaButton href={collection.href} variant="secondary">
                Explore
              </CtaButton>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Coming soon"
        title="Help us plan the next series"
        description="We regularly rotate topics based on what the community wants more of."
        align="center"
        tone="peach"
      >
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-black/80 max-w-2xl">
            Vote on upcoming themes like performance budgets, design leadership, open-source sustainability, and more.
          </p>
          <CtaButton href="/roadmap" variant="secondary">
            View roadmap
          </CtaButton>
        </div>
      </ContentSection>
    </PageShell>
  );
}
