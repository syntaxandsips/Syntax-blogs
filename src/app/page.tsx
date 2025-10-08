import type { Metadata } from "next";
import { NewNavbar } from '@/components/ui/NewNavbar';
import { HeroSection } from '@/components/ui/HeroSection';
import { TopicsSection } from '@/components/ui/TopicsSection';
import { ContentPreview } from '@/components/ui/ContentPreview';
import { NewsletterSection } from '@/components/ui/NewsletterSection';
import { TrendingPosts } from '@/components/ui/TrendingPosts';
import { NewFooter } from '@/components/ui/NewFooter';
import { buildSiteUrl } from '@/lib/site-url';

export function generateMetadata(): Metadata {
  const canonical = buildSiteUrl('/');

  return {
    title: 'Machine Learning Tutorials, Data Science Guides & Tech Reviews',
    description:
      'Syntax & Sips delivers step-by-step machine learning tutorials, quantum computing explainers, coding reviews, and creator interviews every week.',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Machine Learning Tutorials & AI Conversations | Syntax & Sips',
      description:
        'Stay ahead in AI, ML, and quantum computing with Syntax & Sips guides, podcasts, and community deep dives.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Syntax & Sips — AI & ML Tutorials',
      description:
        'Weekly walkthroughs on machine learning, data science, quantum breakthroughs, and creative coding.',
    },
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <NewNavbar />
      <main>
        <HeroSection />
        <TopicsSection />
        <TrendingPosts />
        <ContentPreview />
        <NewsletterSection />
      </main>
      <NewFooter />
    </div>
  );
}
