import type { BlogPostDetail } from '@/lib/posts'
import { buildSiteUrl } from '@/lib/site-url'

interface ArticleJsonLdProps {
  post: BlogPostDetail
  canonicalUrl: string
}

export function ArticleJsonLd({ post, canonicalUrl }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: canonicalUrl,
    headline: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.publishedAt ?? undefined,
    author: {
      '@type': 'Person',
      name: post.author.displayName ?? 'Syntax & Sips Team',
      url: buildSiteUrl('/about'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Syntax & Sips',
      url: buildSiteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: buildSiteUrl('/window.svg'),
      },
    },
    image: post.socialImageUrl ?? post.featuredImageUrl ?? buildSiteUrl('/assets/image.png'),
    keywords: post.tags.join(', '),
  }

  return (
    <script
      key={`article-jsonld-${post.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
