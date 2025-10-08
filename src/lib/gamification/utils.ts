const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isRecord = (value: unknown): value is Record<string, unknown> =>
  isObject(value) && !Array.isArray(value)

export const extractRelationSlug = (relation: unknown): string | null => {
  if (Array.isArray(relation)) {
    for (const entry of relation) {
      const slug = extractRelationSlug(entry)
      if (slug) {
        return slug
      }
    }
    return null
  }

  if (isRecord(relation)) {
    const slugValue = relation.slug
    if (typeof slugValue === 'string' && slugValue.trim().length > 0) {
      return slugValue
    }
  }

  return null
}

export const extractNumericField = (value: unknown, key: string): number | null => {
  if (!isRecord(value)) {
    return null
  }

  const candidate = value[key]
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate
  }

  if (typeof candidate === 'string') {
    const parsed = Number(candidate)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export const ensureJsonRecord = (value: unknown): Record<string, unknown> => {
  if (isRecord(value)) {
    return value
  }

  return {}
}

export type BadgeState = 'awarded' | 'revoked' | 'suspended'

export const isBadgeState = (value: unknown): value is BadgeState =>
  value === 'awarded' || value === 'revoked' || value === 'suspended'

export const toNumber = (value: unknown, defaultValue = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return defaultValue
}

export const toNullableString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    return value
  }

  return null
}

export const isRecordLike = isRecord
