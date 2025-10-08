const DEFAULT_SITE_URL = 'http://localhost:3000'

const normalizeUrl = (url: string) => url.replace(/\/$/, '')

/**
 * Resolve the canonical site URL for the current execution context.
 *
 * Falls back to environment variables (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_VERCEL_URL`, `VERCEL_URL`)
 * or localhost when executed server-side.
 *
 * @returns {string} Normalised absolute origin without a trailing slash.
 */
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

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`)

/**
 * Build an absolute URL by prefixing a path with the resolved site origin.
 *
 * @param {string} [path='/'] Relative path to append.
 * @returns {string} Absolute URL suitable for metadata, emails, or API clients.
 */
export const buildSiteUrl = (path = '/') => `${getSiteUrl()}${ensureLeadingSlash(path)}`
