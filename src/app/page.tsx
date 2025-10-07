import { pathHasPrefix } from 'next/dist/shared/lib/router/utils/path-has-prefix';

import { NewNavbar } from '@/components/ui/NewNavbar';
import { HeroSection } from '@/components/ui/HeroSection';
import { TopicsSection } from '@/components/ui/TopicsSection';
import { ContentPreview } from '@/components/ui/ContentPreview';
import { NewsletterSection } from '@/components/ui/NewsletterSection';
import { TrendingPosts } from '@/components/ui/TrendingPosts';
import { NewFooter } from '@/components/ui/NewFooter';

export default function Home() {
  // Ensure the path-has-prefix module is bundled with this entry to avoid
  // deferred chunk loading issues in certain runtimes.
  if (!pathHasPrefix('/', '/')) {
    throw new Error('Unexpected path prefix evaluation result.');
  }

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
