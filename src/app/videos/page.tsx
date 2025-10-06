import { Metadata } from 'next';
import { Camera, MonitorPlay, Video } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const videoSeries = [
  {
    title: 'UI in Motion',
    length: '8-12 minutes',
    description: 'Practical lessons on accessible animation, transitions, and micro-interactions with code walkthroughs.',
  },
  {
    title: 'Ship it Live',
    length: '25-35 minutes',
    description: 'Unfiltered build sessions where we solve community-submitted tickets and refactor production code.',
  },
  {
    title: 'Tooling deep dives',
    length: '15-20 minutes',
    description: 'Learn how to configure linting, CI pipelines, and deployment workflows for real-world teams.',
  },
];

const upcomingStreams = [
  {
    title: 'Design tokens to production UI',
    date: 'Friday, March 14 • 1:00 PM PT',
    focus: 'Connect Figma variables to a typed token pipeline in your Next.js app.',
  },
  {
    title: 'Observability crash course',
    date: 'Wednesday, March 26 • 9:30 AM PT',
    focus: 'Instrumenting user journeys with OpenTelemetry and visualizing insights in minutes.',
  },
];

const productionPerks = [
  {
    title: 'Downloadable project files',
    description: 'Clone every lesson repo, inspect commits, and reuse ready-to-ship patterns in your own work.',
    icon: MonitorPlay,
  },
  {
    title: 'Closed captions & transcripts',
    description: 'Follow along with accurate captions and transcripts available the moment a video goes live.',
    icon: Video,
  },
  {
    title: 'Pro-grade audio and visuals',
    description: 'Crisp demos filmed with studio gear so you never miss a detail—perfect for group watch sessions.',
    icon: Camera,
  },
];

export const metadata: Metadata = {
  title: 'Videos | Syntax & Sips',
  description: 'On-demand lessons, live streams, and production-grade walkthroughs to help you master modern web development.',
};

export default function VideosPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Video Library"
          title="High-definition lessons for visual learners"
          description="Stream immersive walkthroughs, join live builds, and learn faster with code-forward videos."
          actions={
            <>
              <CtaButton href="/newsletter">Never miss a stream</CtaButton>
              <CtaButton href="/resources" variant="secondary">
                Download assets
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Series spotlight"
        title="Find the perfect format for your learning style"
        description="Explore series that range from quick tips to full rebuilds—each one includes repos, transcripts, and follow-up prompts."
      >
        {videoSeries.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {videoSeries.map((series) => (
              <article
                key={series.title}
                className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <h3 className="text-xl font-black">{series.title}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF5252]">{series.length} average</p>
                <p className="text-sm text-black/70 leading-relaxed">{series.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Live calendar"
        title="Streams happening this month"
        description="RSVP to join live, drop your questions ahead of time, or catch the replay with timestamped chapters."
        tone="lavender"
      >
        {upcomingStreams.length > 0 ? (
          <div className="grid gap-6">
            {upcomingStreams.map((stream) => (
              <article
                key={`${stream.title}-${stream.date}`}
                className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#6C63FF]">{stream.date}</p>
                  <h3 className="text-xl font-black">{stream.title}</h3>
                </div>
                <p className="text-sm max-w-xl text-black/80 md:text-right">{stream.focus}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="What to expect"
        title="Video-first learning without compromise"
        description="Every video is produced with the same attention to clarity and craft as our written tutorials."
        tone="peach"
        align="center"
      >
        {productionPerks.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {productionPerks.map((perk) => (
              <article
                key={perk.title}
                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
              >
                <perk.icon className="h-12 w-12 text-[#FF5252]" aria-hidden="true" />
                <h3 className="text-lg font-black">{perk.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{perk.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Community picks"
        title="Not sure where to start?"
        description="Our team curates playlists for different goals so you can binge-watch with purpose."
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Submit your own recommendation and we might feature it in the next lineup.</p>
            <CtaButton href="/blogs" variant="secondary">
              Read related articles
            </CtaButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Launch your first side project</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              A curated path that moves from idea validation to deployment, including design systems, state management, and observability.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Level up your motion design</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Learn how to use motion intentionally with component-driven animations, scroll-triggered effects, and microinteractions.
            </p>
          </div>
        </div>
      </ContentSection>
    </PageShell>
  );
}
