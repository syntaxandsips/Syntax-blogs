import NewBlogPostClient from '@/app/blogs/[slug]/NewBlogPostClient';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Use the params directly without awaiting
  // This is a simpler approach that avoids the warning
  return <NewBlogPostClient slug={params.slug} />;
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