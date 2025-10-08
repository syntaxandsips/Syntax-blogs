import { Metadata } from 'next';
import { Code2, Compass, Sparkles } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const tutorialTracks = [
  {
    title: 'Launch fundamentals',
    level: 'Beginner friendly',
    description: 'Kickstart your journey with HTML, CSS, accessible layouts, and the tooling you need to ship your first project.',
    duration: '4 weeks • 12 lessons',
  },
  {
    title: 'Production-grade React',
    level: 'Intermediate',
    description: 'Learn how to architect resilient React apps with modern hooks, suspense patterns, and end-to-end testing.',
    duration: '6 weeks • 18 lessons',
  },
  {
    title: 'Full-stack with Next.js',
    level: 'Advanced',
    description: 'Master data fetching, caching strategies, auth flows, and background tasks with the latest Next.js features.',
    duration: '8 weeks • 20 lessons',
  },
];

const liveWorkshops = [
  {
    title: 'Design systems for devs',
    host: 'Hosted by Priya Das',
    date: 'April 2 • 10:00 AM PT',
    focus: 'Create a scalable token pipeline, theme switching, and accessible components.',
  },
  {
    title: 'Serverless debugging clinic',
    host: 'Hosted by Evan Brooks',
    date: 'April 11 • 9:00 AM PT',
    focus: 'Trace cold starts, optimize logs, and monitor distributed workflows.',
  },
  {
    title: 'Animations that ship',
    host: 'Hosted by Mako Ito',
    date: 'April 18 • 12:00 PM PT',
    focus: 'Blend motion with performance budgets using Framer Motion and CSS Houdini.',
  },
];

const learningBenefits = [
  {
    title: 'Guided learning paths',
    description: 'Structured modules with checkpoints, code reviews, and paired practice to reinforce every concept.',
    icon: Compass,
  },
  {
    title: 'Hands-on projects',
    description: 'Build portfolio-ready experiences with clarity on requirements, data models, and real-world constraints.',
    icon: Code2,
  },
  {
    title: 'Micro-learning moments',
    description: 'Bite-sized challenges and daily prompts help you grow even when you only have 20 minutes to spare.',
    icon: Sparkles,
  },
];

export const metadata: Metadata = {
  title: 'Tutorials | Syntax & Sips',
  description:
    'Structured tutorials, live workshops, and learning paths to help you level up your front-end and full-stack skills.',
};

export default function TutorialsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Guided Learning"
          title="Tutorial tracks built for modern web makers"
          description="Choose your adventure, follow along with high-quality lesson plans, and get unstuck with community support."
          actions={
            <>
              <CtaButton href="/newsletter">Join the waitlist</CtaButton>
              <CtaButton href="/resources" variant="secondary">
                Browse resources
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Learning paths"
        title="Start where you are and keep moving"
        description="Each track blends theory with practice, helping you build muscle memory and ship confidently."
      >
        {tutorialTracks.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {tutorialTracks.map((track) => (
              <article
                key={track.title}
                className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <h3 className="text-xl font-black">{track.title}</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">{track.level}</p>
                <p className="text-sm text-black/70 leading-relaxed">{track.description}</p>
                <p className="mt-auto text-sm font-semibold text-black/80">{track.duration}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Live sessions"
        title="Workshops & office hours"
        description="Join real-time events where you can ask questions, share your screen, and learn from fellow builders."
        tone="lavender"
      >
        {liveWorkshops.length > 0 ? (
          <div className="grid gap-6">
            {liveWorkshops.map((workshop) => (
              <article
                key={`${workshop.title}-${workshop.date}`}
                className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-black/40 bg-white/80 p-6 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF5252]">{workshop.date}</p>
                  <h3 className="text-xl font-black">{workshop.title}</h3>
                  <p className="text-sm text-black/70">{workshop.host}</p>
                </div>
                <p className="text-sm max-w-xl text-black/80 md:text-right">{workshop.focus}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Why learners stay"
        title="A learning experience designed to fit your schedule"
        description="From structured roadmaps to on-demand practice, we remove the guesswork so you can focus on progress."
        tone="peach"
        align="center"
      >
        {learningBenefits.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-3">
            {learningBenefits.map((benefit) => (
              <article
                key={benefit.title}
                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-black bg-white/70 p-6 text-center"
              >
                <benefit.icon className="h-12 w-12 text-[#6C63FF]" aria-hidden="true" />
                <h3 className="text-lg font-black">{benefit.title}</h3>
                <p className="text-sm text-black/70 leading-relaxed">{benefit.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        eyebrow="Accountability"
        title="Keep the momentum going"
        description="Track your streaks, celebrate wins, and request feedback without leaving the Syntax & Sips platform."
        footerContent={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-black/70">Want personalized guidance? Book a mentor session and get tailored feedback.</p>
            <CtaButton href="/me" variant="secondary">
              Meet the mentors
            </CtaButton>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Weekly retros</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Reflect on what you shipped, blockers you faced, and goals for the next sprint with guided templates.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-black bg-white/70 p-6">
            <h3 className="text-lg font-black">Community checkpoints</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              Join small-group sessions to demo work, get code reviews, and crowdsource solutions from peers.
            </p>
          </div>
        </div>
      </ContentSection>
    </PageShell>
  );
}
