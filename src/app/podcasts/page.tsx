import { Metadata } from 'next';
import { Headphones, Mic, Radio } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const podcastSeries = [
  {
    title: 'Syntax Shots',
    description: 'Quick, actionable insights on modern web tooling, frameworks, and developer productivity in under 15 minutes.',
    cadence: 'New episodes every Tuesday',
    focus: 'Front-end deep dives & DX tips',
  },
  {
    title: 'Café Conversations',
    description: 'Fireside chats with engineers, designers, and community builders who are shaping the web ecosystem.',
    cadence: 'Long-form interviews every other Thursday',
    focus: 'Career growth, leadership, and tech culture',
  },
  {
    title: 'Release Radar',
    description: 'A round-up of the most important releases, changelog highlights, and experimental projects to try.',
    cadence: 'Weekend recap every Sunday',
    focus: 'Open source & platform updates',
  },
];

const upcomingEpisodes = [
  {
    title: 'Shipping faster with design systems',
    guest: 'Amina Khan, Principal Engineer @ Loom',
    release: 'Tuesday, March 18',
    takeaway: 'How to balance design consistency with rapid experimentation across squads.',
  },
  {
    title: 'Edge runtime best practices',
    guest: 'Miguel Oliveira, Solutions Architect @ Vercel',
    release: 'Thursday, March 27',
    takeaway: 'Deploying resilient edge functions, cold starts, and observability strategies.',
  },
  {
    title: 'Community-sourced developer UX wins',
    guest: 'Panel of Syntax & Sips community contributors',
    release: 'Sunday, April 6',
    takeaway: 'The small quality-of-life updates that made the biggest impact this quarter.',
  },
];

const listeningPlatforms = [
  {
    title: 'Listen your way',
    description:
      'Stream directly in your browser, queue episodes on mobile, or add us to your podcast player of choice with a private RSS feed.',
    icon: Headphones,
  },
  {
    title: 'Stay in sync',
    description:
      'Enable notifications in the Syntax & Sips app to get alerts for fresh drops, transcripts, and exclusive bonus segments.',
    icon: Radio,
  },
  {
    title: 'Read while you listen',
    description:
      'Every episode ships with a detailed companion note, resource list, and code samples so you can follow along at your own pace.',
    icon: Mic,
  },
];

export const metadata: Metadata = {
  title: 'Podcasts | Syntax & Sips',
  description:
    'Explore all Syntax & Sips podcast series, upcoming episodes, and ways to listen across your favorite platforms.',
};

export default function PodcastsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Podcast Hub"
          title="Sip, learn, and ship with our developer-first podcasts"
          description="Fresh conversations, practical deep dives, and real stories from builders on the front lines of the modern web."
          actions={
            <>
              <CtaButton href="/newsletter">Get episode alerts</CtaButton>
              <CtaButton href="/rss" variant="secondary">
                Listen via RSS
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Featured series"
        title="Pick a vibe and start listening"
        description="We curate each show around a unique cadence, so you always know what to expect when you press play."
      >
        {podcastSeries.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {podcastSeries.map((series) => (
              <article
                key={series.title}
                className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1"
              >
                <h3 className="text-xl font-black">{series.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{series.description}</p>
                <dl className="mt-auto space-y-2 text-sm font-semibold">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="uppercase tracking-[0.15em] text-black/60">Cadence</dt>
                    <dd>{series.cadence}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="uppercase tracking-[0.15em] text-black/60">Focus</dt>
                    <dd>{series.focus}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Next up"
        title="Upcoming conversations"
        description="Mark your calendar and send us your questions—every episode features community prompts."
        tone="lavender"
      >
        {upcomingEpisodes.length > 0 ? (
          <div className="grid gap-6">
            {upcomingEpisodes.map((episode) => (
              <article
                key={`${episode.title}-${episode.release}`}
                className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6C63FF]">{episode.release}</p>
                  <h3 className="text-xl font-black">{episode.title}</h3>
                  <p className="text-sm text-black/70">Featuring {episode.guest}</p>
                </div>
                <p className="text-sm max-w-lg text-black/80 md:text-right">{episode.takeaway}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Listening experience"
        title="Meet listeners where they already are"
        description="Whether you tune in between standups or during deep focus time, Syntax & Sips is ready when you are."
        tone="peach"
        align="center"
      >
        {listeningPlatforms.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {listeningPlatforms.map((platform) => (
              <article
                key={platform.title}
                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
              >
                <platform.icon className="h-12 w-12 text-[#FF5252]" aria-hidden="true" />
                <h3 className="text-lg font-black">{platform.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{platform.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Bonus content"
        title="Prefer reading to listening?"
        description="Every podcast has an accompanying blog post. You can skim the highlights, copy the snippets, and share the takeaways."
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Download transcripts, request topics, and submit your own lightning questions.</p>
            <CtaButton href="/blogs" variant="secondary">
              Explore companion posts
            </CtaButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Transcripts & key moments</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Access searchable transcripts with timestamps so you can jump right to the answers you need.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Community AMA sessions</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Join the Syntax & Sips Discord for live recordings, behind-the-scenes notes, and after-hours Q&A sessions.
            </p>
          </div>
        </div>
      </ContentSection>
    </PageShell>
  );
}
