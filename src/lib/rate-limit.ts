const globalRateLimitStore = (() => {
  const globalScope = globalThis as typeof globalThis & {
    __syntaxRateLimiter?: Map<string, { count: number; expiresAt: number }>
  }

  if (!globalScope.__syntaxRateLimiter) {
    globalScope.__syntaxRateLimiter = new Map()
  }

  return globalScope.__syntaxRateLimiter
})()

export interface RateLimitOptions {
  windowMs?: number
  limit?: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export const rateLimit = (
  key: string,
  { windowMs = 60_000, limit = 5 }: RateLimitOptions = {}
): RateLimitResult => {
  const now = Date.now()
  const entry = globalRateLimitStore.get(key)

  if (entry && entry.expiresAt > now) {
    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        reset: entry.expiresAt,
      }
    }

    const nextCount = entry.count + 1
    globalRateLimitStore.set(key, {
      count: nextCount,
      expiresAt: entry.expiresAt,
    })

    return {
      success: true,
      remaining: Math.max(0, limit - nextCount),
      reset: entry.expiresAt,
    }
  }

  const expiresAt = now + windowMs
  globalRateLimitStore.set(key, { count: 1, expiresAt })

  return {
    success: true,
    remaining: Math.max(0, limit - 1),
    reset: expiresAt,
  }
}
