import Link from 'next/link';
import { ContentPageLayout, ContentSection } from '@/components/ui/ContentPageLayout';

const episodes = [
  {
    title: 'Human + Machine: Collaborating with Generative AI',
    description:
      'We dive into the tooling and mental models that help developers pair with AI systems without sacrificing control or creativity.',
    duration: '48 min',
    releaseDate: 'January 22, 2025',
    slug: 'human-machine-generative-ai',
  },
  {
    title: 'From Prototype to Production LLMs',
    description:
      'A candid conversation about scaling large language models, evaluation strategies, and the infrastructure choices that actually work.',
    duration: '56 min',
    releaseDate: 'January 8, 2025',
    slug: 'prototype-to-production-llms',
  },
  {
    title: 'Edge AI in the Real World',
    description:
      'How tiny ML models are reshaping hardware products, with lessons from the teams shipping voice, vision, and predictive experiences.',
    duration: '42 min',
    releaseDate: 'December 18, 2024',
    slug: 'edge-ai-in-the-real-world',
  },
];

const platforms = [
  {
    name: 'Spotify',
    href: 'https://spotify.com',
    description: 'Follow Syntax & Sips on Spotify to catch new episodes the moment they drop.',
  },
  {
    name: 'Apple Podcasts',
    href: 'https://podcasts.apple.com',
    description: 'Leave a review on Apple Podcasts to help more builders discover the show.',
  },
  {
    name: 'Google Podcasts',
    href: 'https://podcasts.google.com',
    description: 'Sync the feed with your Google account and stream on any device.',
  },
  {
    name: 'RSS Feed',
    href: '/rss',
    description: 'Prefer your own player? Subscribe directly through our RSS feed.',
  },
];

const faqs = [
  {
    question: 'How often do new episodes launch?',
    answer:
      'We release a new, fully produced episode every other Wednesday. Expect bonus cuts and live recordings in your feed when big announcements happen.',
  },
  {
    question: 'Can I suggest a topic or guest?',
    answer:
      'Absolutely. Send us a note at hello@syntaxandsips.dev with the subject line “Podcast idea” and include a short summary of what you would love to hear.',
  },
  {
    question: 'Do you offer transcripts?',
    answer:
      'Yes! Every episode ships with human-reviewed transcripts and key takeaways within 48 hours of launch. They are available directly from the episode page.',
  },
];

export const metadata = {
  title: 'Syntax & Sips Podcast',
  description: 'Listen to long-form conversations on AI, machine learning, and the future of developer tooling.',
};

export default function PodcastsPage() {
  return (
    <ContentPageLayout
      badge={<span>Audio Series</span>}
      title="Syntax & Sips Podcast"
      description="Deep technical conversations with builders who are shaping the future of AI. Grab a drink, plug in your headphones, and ship smarter."
      action={
        <>
          <Link
            href="/newsletter"
            className="neo-button bg-black text-white px-5 py-3 text-sm md:text-base"
          >
            Subscribe for episode drops
          </Link>
          <a
            href="https://spotify.com"
            target="_blank"
            rel="noreferrer"
            className="neo-button bg-[#06D6A0] text-black px-5 py-3 text-sm md:text-base"
          >
            Listen on Spotify
          </a>
        </>
      }
    >
      <ContentSection
        eyebrow={<span role="img" aria-label="headphones">🎧</span>}
        title="Latest episodes"
        description="Catch up on the most recent conversations. Every episode is tightly produced with actionable insights and clear takeaways."
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {episodes.map((episode) => (
            <article
              key={episode.slug}
              className="h-full border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-600">
                <span>{episode.releaseDate}</span>
                <span>{episode.duration}</span>
              </div>
              <h3 className="mt-4 text-xl font-black leading-tight">{episode.title}</h3>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{episode.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={`https://spotify.com/episode/${episode.slug}`}
                  className="neo-button bg-[#6C63FF] text-white px-4 py-2 text-sm"
                  target="_blank"
                  rel="noreferrer"
                >
                  Play episode
                </a>
                <Link
                  href={`/blogs/${episode.slug}`}
                  className="neo-button bg-white text-black px-4 py-2 text-sm"
                >
                  Read show notes
                </Link>
              </div>
            </article>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="satellite">📡</span>}
        title="Listen on your favorite platform"
        description="Our feed is syndicated everywhere. Pick the player that fits your workflow and take Syntax & Sips on the go."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              className="block border-4 border-black bg-[#FFD166] p-5 font-semibold text-black shadow-[6px_6px_0_0_#000] transition-transform hover:-translate-y-1"
              target={platform.href.startsWith('http') ? '_blank' : undefined}
              rel={platform.href.startsWith('http') ? 'noreferrer' : undefined}
            >
              <h3 className="text-lg font-black">{platform.name}</h3>
              <p className="mt-2 text-sm leading-relaxed">{platform.description}</p>
            </a>
          ))}
        </div>
      </ContentSection>

      <ContentSection
        eyebrow={<span role="img" aria-label="question mark">❓</span>}
        title="Frequently asked questions"
        description="Everything you need to know about the Syntax & Sips podcast experience."
        fullWidth
      >
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]"
            >
              <summary className="cursor-pointer text-lg font-black">{faq.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">{faq.answer}</p>
            </details>
          ))}
        </div>
      </ContentSection>
    </ContentPageLayout>
  );
}
