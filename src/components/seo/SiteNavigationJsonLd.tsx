import { siteNavigationItems } from '@/lib/navigation'
import { buildSiteUrl } from '@/lib/site-url'

export function SiteNavigationJsonLd() {
  const itemListElement = siteNavigationItems.map((item, index) => ({
    '@type': 'SiteNavigationElement',
    position: index + 1,
    name: item.label,
    url: buildSiteUrl(item.href),
  }))

  if (itemListElement.length === 0) {
    return null
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': itemListElement,
  }

  return (
    <script
      key="site-navigation-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
