import Link from 'next/link';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const resourceGroups = [
  {
    title: 'Playbooks',
    description: 'Opinionated guides that walk you through product decisions, architecture diagrams, and shipping checklists.',
    items: [
      'Launching an AI feature in 30 days',
      'Evaluating foundation models for production',
      'Instrumenting trustworthy metrics for ML systems',
    ],
    accentClass: 'bg-[#6C63FF] text-white',
  },
  {
    title: 'Templates',
    description: 'Reusable docs to help your team align on experimentation, stakeholder updates, and postmortems.',
    items: ['Experiment brief', 'Inference service runbook', 'Incident retrospective'],
    accentClass: 'bg-[#FFD166] text-black',
  },
  {
    title: 'Toolkits',
    description: 'Curated collections of libraries, CLIs, and dashboards that we trust on our own projects.',
    items: ['Prompt engineering starter kit', 'Observability dashboards', 'Security review checklist'],
    accentClass: 'bg-[#06D6A0] text-black',
  },
];

const onboardingSteps = [
  {
    title: 'Create a free workspace',
    description: 'Spin up a Syntax & Sips workspace to access premium templates, API examples, and roadmap trackers.',
  },
  {
    title: 'Sync with your stack',
    description: 'Connect GitHub, Supabase, or your favorite data warehouse to pull real-world examples directly into our notebooks.',
  },
  {
    title: 'Stay accountable',
    description: 'Join focus sprints, track progress with the community, and get tailored nudges when you fall off track.',
  },
];

export const metadata = {
  title: 'Resource Library',
  description: 'Download playbooks, templates, and toolkits that help AI teams move faster with confidence.',
};

export default function ResourcesPage() {
  return (
    <ContentPageLayout
      badge={<span>Resource Hub</span>}
      title="Resource Library"
      description="Battle-tested assets for teams shipping AI experiences. Everything is reviewed quarterly so you always have the latest guidance."
      action={
        <Link href="/newsletter" className="neo-button bg-black text-white px-5 py-3 text-sm md:text-base">
          Unlock new drops first
        </Link>
      }
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="books">📚</span>}
        title="Curated collections"
        description="Pick a collection and start downloading. Each bundle includes version history, usage notes, and recommended follow-up content."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {resourceGroups.map((group) => (
            <article
              key={group.title}
              className={`border-4 border-black p-6 shadow-[6px_6px_0_0_#000] ${group.accentClass}`}
            >
              <h3 className="text-xl font-black leading-tight">{group.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{group.description}</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold">
                {group.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-black/70">▹</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="spark">⚡</span>}
        title="How to get the most out of the library"
        description="We combine the library with a guided onboarding flow so your team can activate the right resources at the right time."
        fullWidth
      >
        <ol className="grid gap-6 md:grid-cols-3">
          {onboardingSteps.map((step, index) => (
            <li
              key={step.title}
              className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
            >
              <span className="text-xs font-black uppercase tracking-widest text-gray-600">Step {index + 1}</span>
              <h3 className="mt-3 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{step.description}</p>
            </li>
          ))}
        </ol>
      </ContentSection>
    </ContentPageLayout>
  );
}
