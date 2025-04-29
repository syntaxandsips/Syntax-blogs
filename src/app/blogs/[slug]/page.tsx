import BlogPostClient from '@/app/blogs/[slug]/BlogPostClient';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Await the params to fix the "params should be awaited" error
  const slug = await Promise.resolve(params.slug);

  // We'll pass the slug to the client component and let it fetch the data
  return <BlogPostClient slug={slug} />;
}

// Include all possible blog slugs for static export
export async function generateStaticParams() {
  // These are the default slugs that we know will exist
  const defaultSlugs = [
    { slug: 'how-llm-works' },
    { slug: 'neural-network-from-scratch' },
    { slug: 'future-quantum-computing' },
    { slug: 'react-18-features' },
    { slug: 'ai-ethics' },
    { slug: 'data-science-python' }
  ];

  // In a production environment, you would fetch these from your CMS or database
  // For now, we'll use the default slugs
  return defaultSlugs;
}