import type { Metadata } from "next";
import { NewBlogsPage } from '@/components/ui/NewBlogsPage';
import { getPublishedPosts } from '@/lib/posts';
import { buildSiteUrl } from '@/lib/site-url';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  const canonical = buildSiteUrl('/blogs');

  return {
    title: 'Syntax & Sips blog — Build notes & release updates',
    description:
      'Browse Syntax & Sips articles documenting how we are building the platform, the decisions we make, and the features we ship.',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Syntax & Sips blog — Build notes & release updates',
      description:
        'Progress updates, documentation drafts, and honest retrospectives from the Syntax & Sips team.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Syntax & Sips blog',
      description: 'Follow the work as we build Syntax & Sips.',
    },
  };
}

export default async function BlogsPage() {
  const posts = await getPublishedPosts();
  return <NewBlogsPage posts={posts} />;
}
