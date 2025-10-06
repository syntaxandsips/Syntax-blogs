import Link from 'next/link';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const learningPaths = [
  {
    title: 'Start here: Machine learning foundations',
    duration: '4 weeks',
    description:
      'Understand the math intuition, Python tooling, and core algorithms that power every production ML system.',
    topics: ['Linear models', 'Gradient descent', 'Model evaluation', 'Responsible AI basics'],
  },
  {
    title: 'Applied deep learning for builders',
    duration: '6 weeks',
    description:
      'Ship vision, language, and multimodal features with modern frameworks while keeping an eye on deployment realities.',
    topics: ['PyTorch workflows', 'Vision transformers', 'Prompt engineering', 'Inference optimization'],
  },
  {
    title: 'MLOps in practice',
    duration: '5 weeks',
    description:
      'Connect experimentation, observability, and continuous delivery so your models thrive after launch.',
    topics: ['Feature stores', 'Experiment tracking', 'Evaluation pipelines', 'Monitoring + alerting'],
  },
];

const projectIdeas = [
  {
    title: 'Coffee bean classifier',
    difficulty: 'Intermediate',
    description:
      'Collect your own dataset, fine-tune a small vision model, and deploy it to a serverless GPU endpoint.',
  },
  {
    title: 'AI pair programming assistant',
    difficulty: 'Advanced',
    description:
      'Prototype an LLM-powered helper that understands your repo context, surfaces docs, and drafts pull request summaries.',
  },
  {
    title: 'Real-time sentiment dashboard',
    difficulty: 'Beginner',
    description:
      'Stream tweets into a lightweight classifier and visualize insights with a modern data stack.',
  },
];

const resources = [
  {
    name: 'Workshop replays',
    description: 'Recorded live sessions with chapter markers and companion notebooks.',
  },
  {
    name: 'Cheat sheets',
    description: 'One-page references for essential formulas, CLI commands, and design patterns.',
  },
  {
    name: 'Community office hours',
    description: 'Join the Syntax & Sips Discord for weekly drop-in support from the team.',
  },
];

export const metadata = {
  title: 'Tutorials & Learning Paths',
  description: 'Structured tutorials that help you learn, build, and ship modern AI experiences with confidence.',
};

export default function TutorialsPage() {
  return (
    <ContentPageLayout
      badge={<span>Guided Learning</span>}
      title="Tutorials & Learning Paths"
      description="Follow curated roadmaps designed for developers who want to master AI and machine learning without losing momentum."
      action={
        <Link href="/newsletter" className="neo-button bg-black text-white px-5 py-3 text-sm md:text-base">
          Get notified about new tutorials
        </Link>
      }
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="sparkles">✨</span>}
        title="Pick a path that matches your goals"
        description="Each path combines written guides, videos, and code sandboxes. Expect weekly milestones, checklists, and built-in retrospectives."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {learningPaths.map((path) => (
            <article
              key={path.title}
              className="flex h-full flex-col border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-600">
                <span>{path.duration}</span>
                <span>Weekly cadence</span>
              </div>
              <h3 className="mt-4 text-xl font-black leading-tight">{path.title}</h3>
              <p className="mt-3 flex-1 text-sm text-gray-700 leading-relaxed">{path.description}</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-gray-800">
                {path.topics.map((topic) => (
                  <li key={topic} className="flex items-center gap-2">
                    <span aria-hidden className="text-[#6C63FF]">▹</span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="rocket">🚀</span>}
        title="Hands-on projects"
        description="Apply what you learn and build a portfolio that showcases real-world skills. Projects include starter repos, architecture diagrams, and testing checklists."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {projectIdeas.map((project) => (
            <article
              key={project.title}
              className="border-4 border-black bg-[#06D6A0] p-6 text-black shadow-[6px_6px_0_0_#000]"
            >
              <p className="text-xs font-bold uppercase tracking-widest">{project.difficulty}</p>
              <h3 className="mt-3 text-xl font-black leading-tight">{project.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{project.description}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="toolbox">🧰</span>}
        title="What you get with every tutorial"
        description="We obsess over the end-to-end learning experience so you can focus on building."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.name}
              className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
            >
              <h3 className="text-lg font-black">{resource.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{resource.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
