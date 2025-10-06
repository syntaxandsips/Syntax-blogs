import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const roadmap = [
  {
    phase: 'Now',
    title: 'Personalized reading experience',
    description:
      'Rolling out user profiles, saved filters, and dynamic recommendations across blogs, podcasts, and videos.',
    items: ['Reader accounts beta', 'Topic follow system', 'Recently played podcast resume'],
  },
  {
    phase: 'Next',
    title: 'Collaboration tools',
    description:
      'Co-editing for changelog drafts, shared annotations, and real-time commenting for teams.',
    items: ['Shared spaces', 'AI-powered editorial suggestions', 'Commenting + mentions'],
  },
  {
    phase: 'Later',
    title: 'Learning workspace',
    description:
      'Integrated notebooks, auto-graded challenges, and a structured curriculum that adapts to progress.',
    items: ['Notebook runtime', 'Project templates', 'Progress dashboards'],
  },
];

const feedbackChannels = [
  {
    label: 'Public roadmap board',
    description: 'Vote on ideas, follow progress, and share feedback in the open.',
    href: 'https://github.com/syntax-and-sips/roadmap/discussions',
  },
  {
    label: 'Creator office hours',
    description: 'Join live sessions twice a month to discuss upcoming features with the team.',
    href: 'https://syntaxandsips.dev/events',
  },
  {
    label: 'Private beta program',
    description: 'Get early access to prototypes in exchange for detailed product feedback.',
    href: 'mailto:beta@syntaxandsips.dev',
  },
];

export const metadata = {
  title: 'Product Roadmap',
  description: 'Follow the Syntax & Sips roadmap to see what we are building now, next, and later.',
};

export default function RoadmapPage() {
  return (
    <ContentPageLayout
      badge={<span>Vision</span>}
      title="Product Roadmap"
      description="Transparency keeps us accountable. Explore what is launching soon, what is in research, and where you can get involved."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="compass">🧭</span>}
        title="Shipping cadence"
        description="We prioritize features that help creators publish faster and help readers learn with less friction."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {roadmap.map((entry) => (
            <article key={entry.title} className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
              <span className="text-xs font-black uppercase tracking-widest text-gray-600">{entry.phase}</span>
              <h3 className="mt-3 text-xl font-black">{entry.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{entry.description}</p>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-gray-800">
                {entry.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-[#FF5252]">▹</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="speech bubble">💬</span>}
        title="Partner with us"
        description="Your feedback shapes the roadmap. Pick a channel and share what would make Syntax & Sips more valuable for you."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {feedbackChannels.map((channel) => (
            <a
              key={channel.label}
              href={channel.href}
              className="block border-4 border-black bg-[#06D6A0] p-6 text-black shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1"
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <h3 className="text-lg font-black">{channel.label}</h3>
              <p className="mt-2 text-sm leading-relaxed">{channel.description}</p>
            </a>
          ))}
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
