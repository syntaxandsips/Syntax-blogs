const DEFAULT_SITE_URL = 'http://localhost:3000'

const normalizeUrl = (url: string) => url.replace(/\/$/, '')

export const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL?.length) {
    return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeUrl(window.location.origin)
  }

  return DEFAULT_SITE_URL
}
