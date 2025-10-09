import { Metadata } from 'next'
import Link from 'next/link'
import { Compass, Sparkles, Users } from 'lucide-react'
import { PageShell, PageHero, ContentSection } from '@/components/ui/PageLayout'

export const metadata: Metadata = {
  title: 'Explore | Syntax & Sips',
  description:
    'Discover the latest stories, shows, and experiments curated by the Syntax & Sips team to keep your creativity flowing.',
}

const highlights = [
  {
    title: 'Editorial highlights',
    description: 'Dive into long-form stories and interviews featuring builders from across the Syntax & Sips universe.',
    icon: Compass,
    href: '/blogs',
    linkLabel: 'Read the newsroom',
  },
  {
    title: 'Community experiments',
    description: 'Remix-ready prompts, code riffs, and collaborative challenges sourced from our contributor roster.',
    icon: Sparkles,
    href: '/explore/prompt-gallery',
    linkLabel: 'Open the prompt gallery',
  },
  {
    title: 'Creator spotlights',
    description: 'Podcasts, workshops, and tutorials led by members who are actively shipping inside the community.',
    icon: Users,
    href: '/podcasts',
    linkLabel: 'Meet the crew',
  },
]

export default function ExplorePage() {
  return (
    <PageShell
      backgroundClassName="bg-gradient-to-br from-[#FFF6EE] via-[#F4F1FF] to-[#E9FBFF]"
      hero={
        <PageHero
          eyebrow="Explore"
          title="Choose your next adventure inside Syntax & Sips"
          description="Curated playlists of content, experiments, and community programs designed to spark fresh ideas and keep you shipping."
        />
      }
    >
      <ContentSection
        eyebrow="Start here"
        title="Curated paths for curious builders"
        description="Each recommendation is updated weekly so there is always something new to explore."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-3xl border-4 border-black bg-white/90 p-6 shadow-[12px_12px_0_rgba(0,0,0,0.1)]"
            >
              <item.icon className="h-10 w-10 text-[#6C63FF]" aria-hidden="true" />
              <h3 className="text-xl font-black text-black">{item.title}</h3>
              <p className="flex-1 text-sm font-medium text-black/70 leading-relaxed">{item.description}</p>
              <Link
                href={item.href}
                className="inline-flex items-center justify-center rounded-full border-2 border-black bg-[#FFD66B] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5"
              >
                {item.linkLabel}
              </Link>
            </article>
          ))}
        </div>
      </ContentSection>
    </PageShell>
  )
}
