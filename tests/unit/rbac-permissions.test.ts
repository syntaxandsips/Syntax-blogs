import { describe, expect, it } from 'vitest'
import {
  compareRolePriority,
  getHighestRoleSlug,
  getRoleBadge,
  hasRoleAtLeast,
  normalizeRoleSlug,
} from '@/lib/rbac/permissions'

const makeRole = (slug: string) => ({
  id: `${slug}-id`,
  slug,
  name: slug,
  description: null,
  priority: 0,
})

describe('rbac permissions helpers', () => {
  it('normalizes legacy slugs to canonical set', () => {
    expect(normalizeRoleSlug('Editor')).toBe('organizer')
    expect(normalizeRoleSlug('author')).toBe('contributor')
    expect(normalizeRoleSlug('ADMIN')).toBe('admin')
    expect(normalizeRoleSlug(undefined)).toBe('member')
  })

  it('computes highest role slug from provided roles', () => {
    const highest = getHighestRoleSlug([
      makeRole('member'),
      makeRole('contributor'),
      makeRole('moderator'),
    ])
    expect(highest).toBe('moderator')
  })

  it('falls back to member when no roles provided', () => {
    expect(getHighestRoleSlug([])).toBe('member')
  })

  it('compares canonical priority', () => {
    expect(compareRolePriority('admin', 'organizer')).toBeGreaterThan(0)
    expect(compareRolePriority('member', 'contributor')).toBeLessThan(0)
  })

  it('evaluates minimum role thresholds', () => {
    const roles = [makeRole('member'), makeRole('organizer')]
    expect(hasRoleAtLeast(roles, 'member')).toBe(true)
    expect(hasRoleAtLeast(roles, 'organizer')).toBe(true)
    expect(hasRoleAtLeast(roles, 'moderator')).toBe(false)
  })

  it('returns badge metadata with tone descriptors', () => {
    const badge = getRoleBadge('moderator')
    expect(badge.slug).toBe('moderator')
    expect(badge.tone).toBe('warning')
  })
})
