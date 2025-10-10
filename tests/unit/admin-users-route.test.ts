import { describe, expect, it } from 'vitest'

import { sanitizeRoleSlugs } from '@/app/api/admin/users/route'

describe('admin users sanitizeRoleSlugs', () => {
  it('normalizes legacy role slugs and removes duplicates', () => {
    const normalized = sanitizeRoleSlugs(['Admin', 'editor', 'EDITOR', 'contributor', 'AUTHOR'])
    expect(normalized).toEqual(['admin', 'organizer', 'contributor'])
  })

  it('returns empty array for non-array input', () => {
    expect(sanitizeRoleSlugs(undefined)).toEqual([])
    expect(sanitizeRoleSlugs('admin' as unknown)).toEqual([])
  })
})
