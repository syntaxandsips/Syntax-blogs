import NewBlogPostClient from '@/app/blogs/[slug]/NewBlogPostClient';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Properly await the params object before accessing its properties
  // This follows Next.js's recommendation to avoid the warning
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  return <NewBlogPostClient slug={slug} />;
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
    { slug: 'data-science-python' },
    // Add the problematic slugs that were causing errors
    { slug: 'how-python-works' },
    { slug: 'how-python-works-' },
    { slug: 'how-lpython-works' },
    { slug: 'how-lpython-works-' },
    // Add common variations with trailing characters that might occur
    { slug: 'how-llm-works-' },
    { slug: 'neural-network-from-scratch-' },
    { slug: 'future-quantum-computing-' },
    { slug: 'react-18-features-' },
    { slug: 'ai-ethics-' },
    { slug: 'data-science-python-' }
  ];

  // In a production environment, you would fetch these from your CMS or database
  // For now, we'll use the default slugs
  return defaultSlugs;
}