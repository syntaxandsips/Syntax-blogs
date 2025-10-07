import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewBlogPostClient from '@/app/blogs/[slug]/NewBlogPostClient';
import { getPublishedPostBySlug, getPublishedSlugs, getRelatedPosts } from '@/lib/posts';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog post not found',
    };
  }

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      type: 'article',
      url: `https://syntaxandsips.com/blogs/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(
    post.id,
    post.category.slug ?? null,
    post.tags,
  );

  return <NewBlogPostClient post={post} relatedPosts={relatedPosts} />;
}
