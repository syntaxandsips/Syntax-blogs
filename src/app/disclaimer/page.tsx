import type { Metadata } from 'next';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const disclaimers = [
  {
    title: 'Educational purposes',
    description:
      'Syntax & Sips content is for educational and informational purposes. Apply judgment before using it in production systems.',
  },
  {
    title: 'No guarantees',
    description:
      'We strive for accuracy, but AI and ML evolve quickly. Validate approaches independently before launching.',
  },
  {
    title: 'Evolving platforms',
    description:
      'Framework APIs, pricing, and policies can shift between publication and your implementation—always re-check official docs.',
  },
];

const responsibilities = [
  'You are responsible for complying with local laws, industry regulations, and internal policies when implementing anything you learn here.',
  'Code samples, prompts, and workflows are provided “as is.” Review security, privacy, and compliance requirements before deploying.',
  'By using Syntax & Sips you agree that we are not liable for damages arising from the use of our content or products.',
];

const escalationPaths = [
  {
    label: 'Report an issue',
    detail: 'Flag inaccuracies directly from any article or email hello@syntaxandsips.com so we can update guidance fast.',
  },
  {
    label: 'Request a review',
    detail: 'Need deeper context for your org? Reach out to our team for tailored workshops or compliance-aligned playbooks.',
  },
];

export const metadata: Metadata = {
  title: 'Disclaimer | Syntax & Sips',
  description: 'Understand the limits of the guidance we publish and how to request clarifications.',
};

export default function DisclaimerPage() {
  return (
    <ContentPageLayout
      badge={<span>Legal</span>}
      title="Disclaimer"
      description="We want you to build confidently. This disclaimer clarifies how to interpret Syntax & Sips content and tools."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="lightbulb">💡</span>}
        title="What to keep in mind"
        description="We love sharing knowledge, but there are a few boundaries."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {disclaimers.map((item) => (
            <div
              key={item.title}
              className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
            >
              <h3 className="text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="clipboard">📋</span>}
        title="Your responsibility"
        description="We provide guidance—you apply it wisely."
        fullWidth
      >
        <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
          {responsibilities.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span aria-hidden className="mt-1 text-[#118AB2]">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="support">🤝</span>}
        title="Need clarification?"
        description="We review every request and iterate quickly when something changes."
      >
        <div className="space-y-4">
          {escalationPaths.map((path) => (
            <div
              key={path.label}
              className="rounded-3xl border-4 border-black bg-[#f8f8ff] px-5 py-4 shadow-[5px_5px_0_0_#000]"
            >
              <h3 className="text-base font-extrabold uppercase tracking-[0.18em] text-black/80">{path.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{path.detail}</p>
            </div>
          ))}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">Last reviewed: March 1, 2025</p>
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
