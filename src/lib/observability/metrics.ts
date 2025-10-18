export type MetricTags = Record<string, string | number | boolean | null | undefined>

type MetricType = 'histogram' | 'counter'

interface MetricPayload {
  metric: string
  value: number
  tags?: MetricTags
  type: MetricType
  timestamp: string
}

const serializeTags = (tags: MetricTags | undefined) => {
  if (!tags) {
    return undefined
  }

  return Object.fromEntries(
    Object.entries(tags).filter(([, value]) => value !== undefined && value !== null),
  )
}

const emitMetric = (payload: MetricPayload) => {
  const serialized = {
    ...payload,
    tags: serializeTags(payload.tags),
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('[metrics]', JSON.stringify(serialized))
  } else {
    console.debug('[metrics]', JSON.stringify(serialized))
  }
}

export const recordHistogram = (metric: string, value: number, tags?: MetricTags) => {
  if (!Number.isFinite(value)) {
    return
  }

  emitMetric({
    metric,
    value,
    tags,
    type: 'histogram',
    timestamp: new Date().toISOString(),
  })
}

export const recordCounter = (metric: string, value = 1, tags?: MetricTags) => {
  if (!Number.isFinite(value)) {
    return
  }

  emitMetric({
    metric,
    value,
    tags,
    type: 'counter',
    timestamp: new Date().toISOString(),
  })
}

export const recordAuthzDeny = (resource: string, tags?: MetricTags) => {
  recordCounter('authz_denied_count', 1, {
    resource,
    ...(tags ?? {}),
  })
}

export const recordContentPublishLatency = (value: number, tags?: MetricTags) => {
  recordHistogram('content_publish_latency_ms', value, tags)
}

export const recordCrashFreeSession = (tags?: MetricTags) => {
  recordCounter('crash_free_sessions', 1, tags)
}

export const recordNavInteraction = (target: string, tags?: MetricTags) => {
  recordCounter('nav_interaction_total', 1, { target, ...(tags ?? {}) })
}
