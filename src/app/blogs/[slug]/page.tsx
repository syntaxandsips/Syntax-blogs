import BlogPostClient from '@/app/blogs/[slug]/BlogPostClient';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Await the params to fix the "params should be awaited" error
  const slug = await Promise.resolve(params.slug);

  // We'll pass the slug to the client component and let it fetch the data
  return <BlogPostClient slug={slug} />;
}

// We don't have static paths anymore since all posts are dynamic
export async function generateStaticParams() {
  return [];
}