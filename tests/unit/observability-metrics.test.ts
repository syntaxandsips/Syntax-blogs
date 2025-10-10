import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { recordAuthzDeny, recordCounter } from '@/lib/observability/metrics'

describe('observability metrics helpers', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    consoleSpy.mockRestore()
    vi.restoreAllMocks()
  })

  it('records counter metrics with serialized tags', () => {
    recordCounter('test_metric', 2, { feature: 'rbac', skip: undefined })

    expect(consoleSpy).toHaveBeenCalledTimes(1)
    const payload = consoleSpy.mock.calls[0]?.[1] as string
    expect(payload).toContain('"metric":"test_metric"')
    expect(payload).toContain('"feature":"rbac"')
    expect(payload).not.toContain('skip')
  })

  it('records authz deny metrics with context tag', () => {
    recordAuthzDeny('admin_users', { reason: 'role_check' })

    expect(consoleSpy).toHaveBeenCalled()
    const payload = consoleSpy.mock.calls.at(-1)?.[1] as string
    expect(payload).toContain('"metric":"authz_denied_count"')
    expect(payload).toContain('"context":"admin_users"')
    expect(payload).toContain('"reason":"role_check"')
  })
})
