const DEFAULT_SITE_URL = 'http://localhost:3000'

const normalizeUrl = (url: string) => url.replace(/\/$/, '')

export const getSiteUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return normalizeUrl(window.location.origin)
  }

  if (process.env.NEXT_PUBLIC_SITE_URL?.length) {
    return normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL)
  }

  const vercelPublic = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelPublic?.length) {
    const formatted = vercelPublic.startsWith('http')
      ? vercelPublic
      : `https://${vercelPublic}`
    return normalizeUrl(formatted)
  }

  const vercelServer = process.env.VERCEL_URL
  if (vercelServer?.length) {
    const formatted = vercelServer.startsWith('http')
      ? vercelServer
      : `https://${vercelServer}`
    return normalizeUrl(formatted)
  }

  return DEFAULT_SITE_URL
}
