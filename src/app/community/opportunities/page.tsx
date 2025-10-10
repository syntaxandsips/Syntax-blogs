import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  ClipboardList,
  Megaphone,
  PenTool,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  PageShell,
  PageHero,
  ContentSection,
  CtaButton,
} from '@/components/ui/PageLayout';

const volunteerFormUrl = 'https://forms.gle/5MNg3oKqSdpZt1oX8';

type OpportunityTrack = {
  title: string;
  icon: LucideIcon;
  mission: string;
  commitment: string;
  responsibilities: string[];
  essentials: string[];
  niceToHave?: string[];
  successIndicators: string[];
};

const opportunityTracks: OpportunityTrack[] = [
  {
    title: 'Social Media Storyteller',
    icon: Megaphone,
    mission:
      'Amplify Syntax & Sips across Instagram, LinkedIn, Twitter/X, and emerging creator platforms with on-brand storytelling.',
    commitment: '4–6 hours per week · Weekly async sync with marketing lead',
    responsibilities: [
      'Draft 3–5 weekly posts, threads, and storyboards tailored to priority channels.',
      'Partner with design on visuals, motion snippets, and caption accessibility.',
      'Monitor comments/DMs, capture community insights, and route questions to the content backlog.',
    ],
    essentials: [
      'Confident writing voice for short-form and carousel-style copy.',
      'Experience using scheduling/analytics tools such as Buffer, Later, or Hootsuite.',
      'Comfort interpreting engagement metrics and iterating based on performance.',
    ],
    niceToHave: [
      'Video editing familiarity (CapCut, Descript) for reels and shorts.',
      'Prior work on brand voice or social playbooks for startups or creator collectives.',
    ],
    successIndicators: [
      'Follower and subscriber growth on priority platforms.',
      'Engagement rate uplift (saves, shares, comments) week over week.',
      'Attribution of social posts to newsletter sign-ups or community joins via UTM tracking.',
    ],
  },
  {
    title: 'Editorial Blogger',
    icon: PenTool,
    mission:
      'Ship long-form articles, interviews, and explainers that showcase community perspectives and practical build notes.',
    commitment: '1 article every 4–6 weeks · 6–8 hours per piece including revisions',
    responsibilities: [
      'Pitch article ideas aligned to roadmap themes using the contributor brief template.',
      'Draft MDX posts, incorporate editor feedback, and collaborate on visuals or embeds.',
      'Participate in monthly editorial salons reviewing analytics and ideating future stories.',
    ],
    essentials: [
      'Portfolio of blog posts, essays, or technical documentation.',
      'Ability to collaborate asynchronously in Notion or Google Docs and ship via Git-based workflows.',
      'Understanding of inclusive language, accessibility, and proper sourcing.',
    ],
    niceToHave: [
      'Podcast or livestream hosting experience to repurpose written work.',
      'Comfort interviewing community members and synthesizing qualitative insights.',
    ],
    successIndicators: [
      'Published articles and editorial calendar coverage across focus topics.',
      'Average read time, scroll depth, and qualitative feedback from readers.',
      'Community shares, reposts, or discussion threads sparked by each story.',
    ],
  },
  {
    title: 'Developer Experience Contributor',
    icon: Sparkles,
    mission:
      'Improve front-end polish, interactive components, and overall developer experience of the Syntax & Sips platform.',
    commitment: '5–8 hours per week · Bi-weekly pairing or office hours with maintainers',
    responsibilities: [
      'Tackle "good first brew" issues and help maintain component consistency.',
      'Prototype gamification widgets or dashboard experiments in feature branches.',
      'Document implementation notes and create Loom walkthroughs for the community.',
    ],
    essentials: [
      'Working knowledge of Next.js, TypeScript, Tailwind CSS, and Git workflows.',
      'Commitment to accessibility (WCAG 2.1) and basic testing via Vitest or Playwright.',
      'Comfort reading product specs and collaborating with design/PM partners.',
    ],
    niceToHave: [
      'Experience with Supabase, Vercel analytics, or experiment frameworks.',
      'Familiarity with animation libraries like Framer Motion or GSAP.',
    ],
    successIndicators: [
      'Merged pull requests and decreased backlog of DX issues.',
      'Positive maintainer reviews and reduced QA feedback loops.',
      'New documentation, Storybook entries, or Loom demos shipped for each feature.',
    ],
  },
  {
    title: 'Community Producer',
    icon: Users,
    mission:
      'Design rituals, prompts, and events that keep Discord and community spaces active and welcoming.',
    commitment: '3–5 hours per week · Monthly retro with community lead',
    responsibilities: [
      'Program a weekly calendar of AMAs, co-working sessions, and build-in-public prompts.',
      'Onboard new members, moderate conversations, and channel feedback to the product backlog.',
      'Publish a monthly "brew report" summarising sentiment, wins, and experiment ideas.',
    ],
    essentials: [
      'Experience moderating online communities or running grassroots programs.',
      'High empathy, inclusive facilitation, and conflict resolution skills.',
      'Familiarity with Discord/Slack automation and event tooling (Luma, Bevy).',
    ],
    niceToHave: [
      'Comfort hosting livestreams, Twitter Spaces, or other real-time formats.',
      'Knowledge of community analytics (retention, participation rate).',
    ],
    successIndicators: [
      'Attendance and retention for flagship events.',
      'Number of actionable feedback items logged for the product/design team.',
      'Sentiment trends and community health metrics quarter over quarter.',
    ],
  },
  {
    title: 'Partnerships & Sponsorship Scout',
    icon: ClipboardList,
    mission:
      'Source collaborations with tool vendors, educators, and creators that expand reach and unlock resources.',
    commitment: '3–4 hours per week · Bi-weekly check-in with marketing lead',
    responsibilities: [
      'Research aligned partners and maintain a living outreach tracker.',
      'Draft pitch decks, outreach emails, and sponsorship packages tailored to prospect goals.',
      'Coordinate handoffs so activations land smoothly across content, events, and social.',
    ],
    essentials: [
      'Confidence crafting outreach copy and updating lightweight CRMs (Airtable/Notion).',
      'Understanding of marketing metrics (CTR, CPM) and developer audience value props.',
      'Organised, follow-through oriented, and comfortable in async collaboration.',
    ],
    niceToHave: [
      'Experience negotiating agreements or supporting brand partnerships.',
      'Network across dev tooling, education, or indie creator ecosystems.',
    ],
    successIndicators: [
      'Qualified conversations started and partnership pipeline velocity.',
      'Signed collaborations or sponsorship commitments (cash or in-kind).',
      'Partner satisfaction scores and repeat activations.',
    ],
  },
];

const onboardingFlow = [
  {
    title: 'Share your focus',
    description:
      'Complete the short application form with role interest, availability, and portfolio links so we can match you quickly.',
  },
  {
    title: 'Meet the crew',
    description:
      'A community producer schedules a 20-minute intro call or async DM to align on goals, expectations, and first deliverables.',
  },
  {
    title: 'Grab the starter kit',
    description:
      'Accepted contributors receive access to the Notion workspace, brand voice guide, templates, and milestone calendar.',
  },
  {
    title: 'Launch your first sprint',
    description:
      'We pair you with a mentor, scope a 30-day plan, and schedule regular touchpoints to keep momentum high.',
  },
];

const roadmapPhases = [
  {
    phase: 'Phase 0 — Prep',
    timeline: 'Week 0',
    focus: 'Infrastructure & Assets',
    activities: [
      'Publish this opportunity hub and update navigation links.',
      'Finalise Google Form questions, confirmation emails, and CRM pipeline.',
      'Refresh brand voice, social templates, and onboarding documentation.',
    ],
  },
  {
    phase: 'Phase 1 — Recruit',
    timeline: 'Weeks 1–2',
    focus: 'Awareness & Sourcing',
    activities: [
      'Ship announcement blog, newsletter spotlight, and cross-platform social blitz.',
      'Host a live AMA or community town hall introducing the program.',
      'Personally invite high-signal community members and partners.',
    ],
  },
  {
    phase: 'Phase 2 — Onboard',
    timeline: 'Weeks 3–4',
    focus: 'Enablement & Pairing',
    activities: [
      'Run kickoff workshop covering rituals, deliverable expectations, and success metrics.',
      'Assign mentors and match each contributor to a scoped first project.',
      'Set up shared Notion board to track deliverables and provide feedback loops.',
    ],
  },
  {
    phase: 'Phase 3 — Ship',
    timeline: 'Weeks 5–8',
    focus: 'Execution & Momentum',
    activities: [
      'Hold weekly async updates or stand-ups to surface blockers.',
      'Spotlight shipped work in the community and newsletter to celebrate contributors.',
      'Collect qualitative feedback from audiences and feed insights into the roadmap.',
    ],
  },
  {
    phase: 'Phase 4 — Scale',
    timeline: 'Week 9+',
    focus: 'Optimisation & Growth',
    activities: [
      'Review metrics, contributor retention, and role coverage gaps.',
      'Introduce advanced roles (video editor, curriculum architect) or stipends as needed.',
      'Package learnings into docs/community playbooks and share with leadership.',
    ],
  },
];

const feedbackLoops = [
  'Embed the Google Form link across Discord channels, newsletters, and social bios for always-on feedback.',
  'Run a quarterly community survey capturing NPS, top feature requests, and content preferences.',
  'Publish a monthly "brew report" summarising wins, metrics, and upcoming experiments.',
  'Host mentor office hours twice a month for real-time troubleshooting and coaching.',
  'Log actionable insights directly into the product backlog so roadmap priorities stay community-informed.',
];

export const metadata: Metadata = {
  title: 'Community Opportunities | Syntax & Sips',
  description:
    'Discover volunteer and internship opportunities across content, community, and product tracks — plus the roadmap to activate the program.',
};

export default function CommunityOpportunitiesPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Community Programs"
          title="Build Syntax & Sips alongside the crew"
          description="Raise your hand to help us ship stories, community rituals, and polished product experiences ahead of launch. Choose a track, apply in minutes, and plug into an engaged team."
          actions={
            <>
              <CtaButton href={volunteerFormUrl} target="_blank" rel="noreferrer">
                Apply via Google Form
              </CtaButton>
              <CtaButton href="/docs" variant="secondary">
                Browse contributor guides
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        id="roles"
        eyebrow="Volunteer & internship tracks"
        title="Where you can make an immediate impact"
        description="Every opportunity includes clear responsibilities, time expectations, and success signals so you can pick the lane that fits your energy."
      >
        <div className="grid gap-10 lg:grid-cols-2">
          {opportunityTracks.map((track) => (
            <article
              key={track.title}
              className="flex h-full flex-col gap-6 rounded-3xl border-4 border-[#121212] bg-white p-8 shadow-[10px_10px_0px_#121212]"
            >
              <header className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-[#121212] bg-[#FFCF56] shadow-[6px_6px_0px_#121212]">
                    <track.icon className="h-7 w-7 text-[#121212]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-2xl font-black uppercase text-[#121212]">{track.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#2F2F2F] leading-relaxed">{track.mission}</p>
                  </div>
                </div>
                <p className="inline-flex max-w-max items-center rounded-xl border-2 border-dashed border-[#6C63FF] bg-[#F5F4FF] px-4 py-1 text-xs font-black uppercase tracking-wide text-[#121212]">
                  {track.commitment}
                </p>
              </header>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-[#121212]">Responsibilities</h4>
                  <ul className="space-y-2 text-sm font-semibold text-[#3B3B3B] leading-relaxed list-disc pl-5">
                    {track.responsibilities.map((responsibility) => (
                      <li key={responsibility}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-black uppercase tracking-wide text-[#121212]">Essentials</h4>
                  <ul className="space-y-2 text-sm font-semibold text-[#3B3B3B] leading-relaxed list-disc pl-5">
                    {track.essentials.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                  {track.niceToHave ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-black uppercase tracking-wide text-[#6C63FF]">Bonus skills</h5>
                      <ul className="space-y-2 text-sm font-semibold text-[#3B3B3B] leading-relaxed list-disc pl-5">
                        {track.niceToHave.map((bonus) => (
                          <li key={bonus}>{bonus}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border-4 border-[#121212] bg-[#FEE8D6] p-4 shadow-[6px_6px_0px_#121212]">
                <h4 className="text-sm font-black uppercase tracking-wide text-[#121212]">What success looks like</h4>
                <ul className="space-y-2 text-sm font-semibold text-[#3B3B3B] leading-relaxed list-disc pl-5">
                  {track.successIndicators.map((indicator) => (
                    <li key={indicator}>{indicator}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="How it works"
        title="Your path from interest to impact"
        description="We designed the onboarding flow to be fast, personal, and transparent so you can start creating quickly."
        tone="lavender"
      >
        <div className="grid gap-6 md:grid-cols-4">
          {onboardingFlow.map((step, index) => (
            <div
              key={step.title}
              className="flex h-full flex-col gap-3 rounded-3xl border-4 border-[#121212] bg-white p-5 text-left shadow-[8px_8px_0px_#121212]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#121212] bg-[#FFD66B] text-base font-black uppercase text-[#121212]">
                {index + 1}
              </span>
              <h3 className="text-base font-black uppercase text-[#121212]">{step.title}</h3>
              <p className="text-sm font-semibold text-[#3B3B3B] leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-4 border-dashed border-[#121212]/40 bg-white/60 p-6">
          <p className="max-w-2xl text-sm font-semibold text-[#2F2F2F] leading-relaxed">
            Questions before you apply? Drop into the #community-intros channel or email hello@syntaxandsips.com and we will pair you with a mentor.
          </p>
          <CtaButton href={volunteerFormUrl} target="_blank" rel="noreferrer">
            Fill out the form
          </CtaButton>
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Roadmap"
        title="Launch plan to grow the program"
        description="Use these phases to coordinate announcements, onboarding, and measurement as the community scales."
        tone="peach"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {roadmapPhases.map((phase) => (
            <article
              key={phase.phase}
              className="flex h-full flex-col gap-4 rounded-3xl border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#6C63FF]">{phase.timeline}</p>
                  <h3 className="text-lg font-black uppercase text-[#121212]">{phase.phase}</h3>
                </div>
                <CalendarClock className="h-8 w-8 text-[#FF5252]" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-[#2F2F2F]">{phase.focus}</p>
              <ul className="space-y-2 text-sm font-semibold text-[#3B3B3B] leading-relaxed list-disc pl-5">
                {phase.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Keep the loop tight"
        title="Feedback rituals to stay community-led"
        description="Blend async and live touchpoints so volunteers feel supported and product decisions stay rooted in real signals."
      >
        <ul className="space-y-4">
          {feedbackLoops.map((loop) => (
            <li
              key={loop}
              className="rounded-3xl border-4 border-[#121212] bg-white p-5 text-sm font-semibold leading-relaxed text-[#2F2F2F] shadow-[6px_6px_0px_#121212]"
            >
              {loop}
            </li>
          ))}
        </ul>
      </ContentSection>
    </PageShell>
  );
}
