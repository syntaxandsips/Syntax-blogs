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
      images:
        post.socialImageUrl || post.featuredImageUrl
          ? [
              {
                url: post.socialImageUrl ?? post.featuredImageUrl!,
                width: 1200,
                height: 630,
              },
            ]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images:
        post.socialImageUrl || post.featuredImageUrl
          ? [post.socialImageUrl ?? post.featuredImageUrl!]
          : undefined,
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
