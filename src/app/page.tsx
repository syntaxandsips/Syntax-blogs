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
    title: 'Syntax & Sips — Build log & documentation',
    description:
      'Follow the work as we build the Syntax & Sips editorial platform. Read progress notes, documentation drafts, and public release updates.',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Syntax & Sips — Build log & documentation',
      description:
        'Progress updates, changelog notes, and honest documentation about creating the Syntax & Sips platform.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Syntax & Sips build log',
      description: 'Progress notes and documentation from the Syntax & Sips team.',
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
