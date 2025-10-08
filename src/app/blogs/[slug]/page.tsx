import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewBlogPostClient from '@/app/blogs/[slug]/NewBlogPostClient';
import { ArticleJsonLd } from '@/components/seo/ArticleJsonLd';
import { BreadcrumbJsonLd } from '@/components/seo/BreadcrumbJsonLd';
import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { getPublishedPostBySlug, getPublishedSlugs, getRelatedPosts } from '@/lib/posts';
import { buildSiteUrl } from '@/lib/site-url';

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

  const canonicalUrl = buildSiteUrl(`/blogs/${post.slug}`);

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      type: 'article',
      url: canonicalUrl,
      publishedTime: post.publishedAt ?? undefined,
      images:
        post.socialImageUrl || post.featuredImageUrl
          ? [
              {
                url: post.socialImageUrl ?? post.featuredImageUrl!,
                width: 1200,
                height: 630,
                alt: post.title,
              },
            ]
          : [
              {
                url: `${buildSiteUrl('/assets/image.png')}`,
                width: 1200,
                height: 630,
                alt: 'Syntax & Sips default social cover',
              },
            ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt ?? undefined,
      images:
        post.socialImageUrl || post.featuredImageUrl
          ? [post.socialImageUrl ?? post.featuredImageUrl!]
          : [`${buildSiteUrl('/assets/image.png')}`],
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

  const canonicalUrl = buildSiteUrl(`/blogs/${post.slug}`);
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blogs' },
  ];

  if (post.category.slug) {
    breadcrumbItems.push({
      label: post.category.name ?? post.category.slug,
      href: `/topics/${post.category.slug}`,
    });
  }

  breadcrumbItems.push({ label: post.title });

  return (
    <>
      <ArticleJsonLd post={post} canonicalUrl={canonicalUrl} />
      <BreadcrumbJsonLd
        items={breadcrumbItems.map((item) => ({
          name: item.label,
          url: item.href ? buildSiteUrl(item.href) : canonicalUrl,
        }))}
      />
      <NewBlogPostClient
        post={post}
        relatedPosts={relatedPosts}
        canonicalUrl={canonicalUrl}
        breadcrumbs={breadcrumbItems}
      />
    </>
  );
}
