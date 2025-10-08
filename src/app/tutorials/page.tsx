import { Metadata } from 'next';
import { BookOpen, ClipboardList, FileText, GraduationCap } from 'lucide-react';
import { PageShell, PageHero, ContentSection, CtaButton } from '@/components/ui/PageLayout';

const availableLearning = [
  {
    title: 'In-depth articles',
    description: 'Our blog posts capture the same walkthroughs that will become structured lessons.',
    href: '/blogs',
    icon: FileText,
  },
  {
    title: 'Project documentation',
    description: 'The documentation folder is public, including content style guides and technical references.',
    href: '/docs/markdown-guide.md',
    icon: BookOpen,
  },
];

const curriculumTasks = [
  'Finalising the learning objectives for each module.',
  'Recording practice projects that match the written guides.',
  'Automating progress tracking so you can pick up where you left off.',
];

const supportPlans = [
  {
    title: 'Feedback loops',
    description: 'Every tutorial will include a feedback form so we can expand or clarify the tricky steps.',
  },
  {
    title: 'Community sharing',
    description: 'We are preparing a lightweight showcase to highlight learner projects once the courses launch.',
  },
];

export const metadata: Metadata = {
  title: 'Tutorials roadmap | Syntax & Sips',
  description:
    'See the current status of the Syntax & Sips tutorial library. Lessons are still in production—follow along while we finish them.',
};

export default function TutorialsPage() {
  return (
    <PageShell
      hero={
        <PageHero
          eyebrow="Work in progress"
          title="Tutorial tracks are not live yet"
          description="We are assembling the curriculum now. Until the full experience is ready, here is what you can access today."
          actions={
            <>
              <CtaButton href="/blogs">Browse current guides</CtaButton>
              <CtaButton href="/newsletter" variant="secondary">
                Get launch emails
              </CtaButton>
            </>
          }
        />
      }
    >
      <ContentSection
        eyebrow="Start here"
        title="Learning material that exists today"
        description="These resources mirror the topics we plan to expand into full tutorials."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {availableLearning.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col gap-4 rounded-2xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-black/60">
                <item.icon className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
                {item.title}
              </div>
              <p className="text-sm text-black/70 leading-relaxed">{item.description}</p>
              <CtaButton href={item.href}>Open</CtaButton>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Production status"
        title="What we are building"
        description="A quick look at the checklist we are working through before the first cohort launches."
        tone="lavender"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {curriculumTasks.map((task) => (
            <li
              key={task}
              className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-black/30 bg-white/70 p-6 text-sm text-black/70"
            >
              <ClipboardList className="mt-0.5 h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
              <span>{task}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        eyebrow="Learner support"
        title="How we will help you stay on track"
        description="These programs will launch alongside the tutorials."
        tone="peach"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {supportPlans.map((plan) => (
            <article
              key={plan.title}
              className="flex flex-col gap-3 rounded-2xl border-2 border-black bg-white/70 p-6"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-[#FF5252]">
                <GraduationCap className="h-4 w-4" aria-hidden="true" />
                Planned
              </div>
              <h3 className="text-lg font-black text-black">{plan.title}</h3>
              <p className="text-sm text-black/70 leading-relaxed">{plan.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow="Course library"
        title="Published tutorials"
        description="This space will list every lesson once they go live."
      >
        {null}
      </ContentSection>
    </PageShell>
  );
}
