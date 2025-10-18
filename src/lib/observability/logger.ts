import { createHash } from 'node:crypto'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface StructuredLogPayload {
  message: string
  level?: LogLevel
  requestId?: string | null
  userId?: string | null
  featureFlags?: string[]
  spaceId?: string | null
  metadata?: Record<string, unknown>
}

const hashIdentifier = (value: string | null | undefined): string | null => {
  if (!value) {
    return null
  }

  const hash = createHash('sha256')
  hash.update(value)
  return hash.digest('hex').slice(0, 32)
}

export const logStructuredEvent = ({
  message,
  level = 'info',
  requestId,
  userId,
  featureFlags,
  spaceId,
  metadata = {},
}: StructuredLogPayload) => {
  const payload = {
    ts: new Date().toISOString(),
    level,
    message,
    request_id: requestId ?? null,
    user_id_hash: hashIdentifier(userId),
    space_id: spaceId ?? null,
    feature_flags: featureFlags ?? [],
    metadata,
  }

  if (level === 'error') {
    console.error('[structured-log]', JSON.stringify(payload))
  } else if (level === 'warn') {
    console.warn('[structured-log]', JSON.stringify(payload))
  } else if (level === 'debug') {
    console.debug('[structured-log]', JSON.stringify(payload))
  } else {
    console.log('[structured-log]', JSON.stringify(payload))
  }
}
