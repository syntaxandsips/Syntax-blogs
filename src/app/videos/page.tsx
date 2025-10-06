import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';
import YouTubeEmbed from '@/components/ui/YouTubeEmbed';

const series = [
  {
    title: 'Ship it live',
    description:
      'Live coding sessions where we build features end-to-end. Expect real-time debugging and honest conversations about trade-offs.',
    videos: ['dQw4w9WgXcQ', 'kXYiU_JCYtU'],
  },
  {
    title: 'AI architecture reviews',
    description:
      'We unpack the systems behind products you love and highlight the design decisions that keep them resilient.',
    videos: ['L_jWHffIx5E', '3fumBcKC6RE'],
  },
];

const productionTips = [
  {
    title: 'Record-ready checklists',
    description: 'Keep your audio and screen capture crisp with studio-tested setups that do not break the budget.',
  },
  {
    title: 'Annotated repos',
    description: 'Clone the exact code we use in every video, complete with branches for each stage of the build.',
  },
  {
    title: 'Captions & transcripts',
    description: 'Accessibility matters. We ship every upload with open captions, transcripts, and additional reading.',
  },
];

export const metadata = {
  title: 'Video Library',
  description: 'Watch Syntax & Sips build modern AI experiences in real time with battle-tested workflows.',
};

export default function VideosPage() {
  return (
    <ContentPageLayout
      badge={<span>Video</span>}
      title="Watch Syntax & Sips"
      description="Grab your favorite beverage and code alongside us. These episodes focus on real projects, real feedback, and shippable results."
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="camera">🎥</span>}
        title="Featured series"
        description="Curated playlists designed to help you level up quickly. We share context, code, and design thinking for every episode."
        fullWidth
      >
        <div className="space-y-10">
          {series.map((entry) => (
            <article key={entry.title} className="space-y-4">
              <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
                <h3 className="text-2xl font-black">{entry.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-700">{entry.description}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {entry.videos.map((videoId) => (
                  <YouTubeEmbed key={videoId} videoId={videoId} />
                ))}
              </div>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="clapper board">🎬</span>}
        title="Production that respects your time"
        description="We obsess over clarity so you never wonder what to do next."
        fullWidth
      >
        <div className="grid gap-6 md:grid-cols-3">
          {productionTips.map((tip) => (
            <div key={tip.title} className="border-4 border-black bg-[#FF5252] p-6 text-white shadow-[6px_6px_0_0_#000]">
              <h3 className="text-lg font-black">{tip.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/90">{tip.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
