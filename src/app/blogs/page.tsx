import type { Metadata } from "next";
import { NewBlogsPage } from '@/components/ui/NewBlogsPage';
import { getPublishedPosts } from '@/lib/posts';
import { buildSiteUrl } from '@/lib/site-url';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  const canonical = buildSiteUrl('/blogs');

  return {
    title: 'AI, Machine Learning & Data Science Blog Library',
    description:
      'Browse Syntax & Sips articles on machine learning, data science workflows, quantum computing experiments, and coding best practices.',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title: 'Syntax & Sips Blog — Machine Learning, Quantum & Coding Tutorials',
      description:
        'Filter hundreds of Syntax & Sips tutorials, reviews, and explainers spanning ML, data engineering, quantum computing, and creative coding.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Syntax & Sips Blog',
      description:
        'Stay current with Syntax & Sips machine learning and quantum computing breakdowns.',
    },
  };
}

export default async function BlogsPage() {
  const posts = await getPublishedPosts();
  return <NewBlogsPage posts={posts} />;
}
