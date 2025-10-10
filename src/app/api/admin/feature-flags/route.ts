import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  FEATURE_FLAG_DEFAULTS,
  FEATURE_FLAG_KEYS,
  type FeatureFlagDefinition,
  type FeatureFlagKey,
} from '@/lib/feature-flags/registry'
import {
  getFeatureFlagDefinition,
  invalidateFeatureFlagCache,
  upsertFeatureFlagCache,
} from '@/lib/feature-flags/server'
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import type { AdminFeatureFlagAuditEntry, AdminFeatureFlagRecord } from '@/utils/types'

interface ProfileRecord {
  id: string
  is_admin: boolean
}

const createFlagSchema = z.object({
  flagKey: z.enum(FEATURE_FLAG_KEYS),
  description: z.string().trim().min(1).max(280).optional(),
  owner: z.string().trim().min(1).max(120).optional(),
  enabled: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  reason: z.string().trim().max(280).optional(),
})

const updateFlagSchema = z.object({
  flagKey: z.enum(FEATURE_FLAG_KEYS),
  description: z.string().trim().min(1).max(280).optional(),
  owner: z.string().trim().min(1).max(120).optional(),
  enabled: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  reason: z.string().trim().max(280).optional(),
})

const mapToAdminRecord = (
  definition: FeatureFlagDefinition,
  options?: Partial<{
    id: string
    createdBy: string | null
    updatedBy: string | null
    persisted: boolean
  }>,
): AdminFeatureFlagRecord => ({
  id: options?.id ?? null,
  flagKey: definition.flagKey,
  description: definition.description,
  owner: definition.owner,
  enabled: definition.enabled,
  metadata: definition.metadata,
  createdAt: definition.createdAt,
  updatedAt: definition.updatedAt,
  createdBy: options?.createdBy ?? null,
  updatedBy: options?.updatedBy ?? null,
  persisted: options?.persisted ?? false,
})

const mapAuditRow = (row: Database['public']['Tables']['feature_flag_audit']['Row']): AdminFeatureFlagAuditEntry => ({
  id: row.id,
  flagKey: row.flag_key,
  previousEnabled: row.previous_enabled ?? null,
  newEnabled: row.new_enabled ?? null,
  changedBy: row.changed_by ?? null,
  changedByRole: row.changed_by_role,
  reason: row.reason ?? null,
  metadata: row.metadata ?? {},
  createdAt: row.created_at,
})

const requireAdminProfile = async (): Promise<{ profile: ProfileRecord } | { response: NextResponse }> => {
  const supabase = createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return {
      response: NextResponse.json({ error: `Unable to load session: ${authError.message}` }, { status: 500 }),
    }
  }

  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, is_admin')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRecord>()

  if (error) {
    return {
      response: NextResponse.json(
        { error: `Unable to load profile: ${error.message}` },
        { status: 500 },
      ),
    }
  }

  if (!profile?.is_admin) {
    return { response: NextResponse.json({ error: 'Forbidden: admin access required.' }, { status: 403 }) }
  }

  return { profile }
}

const buildAdminFlagSet = async (
  rows: Database['public']['Tables']['feature_flags']['Row'][] | null,
): Promise<AdminFeatureFlagRecord[]> => {
  const map = new Map<FeatureFlagKey, AdminFeatureFlagRecord>()

  for (const key of FEATURE_FLAG_KEYS) {
    const definition = await getFeatureFlagDefinition(key)
    map.set(key, mapToAdminRecord(definition))
  }

  for (const row of rows ?? []) {
    const definition: FeatureFlagDefinition = {
      flagKey: row.flag_key,
      description: row.description ?? FEATURE_FLAG_DEFAULTS[row.flag_key].description,
      enabled: row.enabled ?? false,
      owner: row.owner ?? FEATURE_FLAG_DEFAULTS[row.flag_key].owner,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }

    map.set(
      row.flag_key,
      mapToAdminRecord(definition, {
        id: row.id,
        createdBy: row.created_by ?? null,
        updatedBy: row.updated_by ?? null,
        persisted: true,
      }),
    )
  }

  return Array.from(map.values())
}

export async function GET() {
  const result = await requireAdminProfile()

  if ('response' in result) {
    return result.response
  }

  const serviceClient = createServiceRoleClient<Database>()

  const [{ data: flags, error: flagError }, { data: audit, error: auditError }] = await Promise.all([
    serviceClient
      .from('feature_flags')
      .select(
        'id, flag_key, description, enabled, owner, metadata, created_at, updated_at, created_by, updated_by',
      )
      .order('flag_key', { ascending: true }),
    serviceClient
      .from('feature_flag_audit')
      .select('id, flag_key, previous_enabled, new_enabled, changed_by, changed_by_role, reason, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  if (flagError) {
    return NextResponse.json({ error: `Unable to load feature flags: ${flagError.message}` }, { status: 500 })
  }

  if (auditError) {
    return NextResponse.json({ error: `Unable to load feature flag audit: ${auditError.message}` }, { status: 500 })
  }

  const records = await buildAdminFlagSet(flags)
  const auditLog = (audit ?? []).map(mapAuditRow)

  return NextResponse.json({
    flags: records,
    audit: auditLog,
    defaults: FEATURE_FLAG_DEFAULTS,
  })
}

export async function POST(request: Request) {
  const result = await requireAdminProfile()

  if ('response' in result) {
    return result.response
  }

  const payload = await request.json().catch(() => ({}))
  const parseResult = createFlagSchema.safeParse(payload)

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 422 })
  }

  const { profile } = result
  const { flagKey, description, owner, enabled, metadata, reason } = parseResult.data
  const defaults = FEATURE_FLAG_DEFAULTS[flagKey]

  const serviceClient = createServiceRoleClient<Database>()

  const { data: existing, error: existingError } = await serviceClient
    .from('feature_flags')
    .select('id')
    .eq('flag_key', flagKey)
    .maybeSingle<{ id: string }>()

  if (existingError) {
    return NextResponse.json({ error: `Unable to verify feature flag: ${existingError.message}` }, { status: 500 })
  }

  if (existing) {
    return NextResponse.json({ error: 'Feature flag already exists.' }, { status: 409 })
  }

  const { data, error } = await serviceClient
    .from('feature_flags')
    .insert({
      flag_key: flagKey,
      description: description ?? defaults.description,
      owner: owner ?? defaults.owner,
      enabled: enabled ?? false,
      metadata: metadata ?? {},
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select(
      'id, flag_key, description, enabled, owner, metadata, created_at, updated_at, created_by, updated_by',
    )
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: `Unable to create feature flag: ${error?.message ?? 'Unknown error'}` }, { status: 500 })
  }

  const definition: FeatureFlagDefinition = {
    flagKey: data.flag_key,
    description: data.description ?? defaults.description,
    enabled: data.enabled ?? false,
    owner: data.owner ?? defaults.owner,
    metadata: data.metadata ?? {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  upsertFeatureFlagCache(definition)

  await serviceClient.from('feature_flag_audit').insert({
    flag_id: data.id,
    flag_key: data.flag_key,
    previous_enabled: null,
    new_enabled: definition.enabled,
    changed_by: profile.id,
    changed_by_role: 'admin',
    reason: reason ?? 'created',
    metadata: {
      reason: reason ?? 'created',
      owner: definition.owner,
    },
  })

  const flags = await buildAdminFlagSet([data])
  const createdRecord =
    flags.find((entry) => entry.flagKey === data.flag_key) ??
    mapToAdminRecord(definition, {
      id: data.id,
      createdBy: data.created_by ?? null,
      updatedBy: data.updated_by ?? null,
      persisted: true,
    })

  return NextResponse.json({
    flag: createdRecord,
    message: 'Feature flag created successfully.',
  })
}

export async function PATCH(request: Request) {
  const result = await requireAdminProfile()

  if ('response' in result) {
    return result.response
  }

  const payload = await request.json().catch(() => ({}))
  const parseResult = updateFlagSchema.safeParse(payload)

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid payload', details: parseResult.error.flatten() }, { status: 422 })
  }

  const { profile } = result
  const { flagKey, description, owner, enabled, metadata, reason } = parseResult.data

  const serviceClient = createServiceRoleClient<Database>()

  const { data: existing, error: existingError } = await serviceClient
    .from('feature_flags')
    .select(
      'id, flag_key, description, enabled, owner, metadata, created_at, updated_at, created_by, updated_by',
    )
    .eq('flag_key', flagKey)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: `Unable to load feature flag: ${existingError.message}` }, { status: 500 })
  }

  if (!existing) {
    return NextResponse.json({ error: 'Feature flag not found.' }, { status: 404 })
  }

  const nextDescription = description ?? existing.description ?? FEATURE_FLAG_DEFAULTS[flagKey].description
  const nextOwner = owner ?? existing.owner ?? FEATURE_FLAG_DEFAULTS[flagKey].owner
  const nextEnabled = typeof enabled === 'boolean' ? enabled : existing.enabled ?? false
  const nextMetadata = metadata ?? existing.metadata ?? {}

  const { data, error } = await serviceClient
    .from('feature_flags')
    .update({
      description: nextDescription,
      owner: nextOwner,
      enabled: nextEnabled,
      metadata: nextMetadata,
      updated_by: profile.id,
    })
    .eq('id', existing.id)
    .select(
      'id, flag_key, description, enabled, owner, metadata, created_at, updated_at, created_by, updated_by',
    )
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: `Unable to update feature flag: ${error?.message ?? 'Unknown error'}` }, { status: 500 })
  }

  const definition: FeatureFlagDefinition = {
    flagKey: data.flag_key,
    description: data.description ?? nextDescription,
    enabled: data.enabled ?? nextEnabled,
    owner: data.owner ?? nextOwner,
    metadata: data.metadata ?? nextMetadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  upsertFeatureFlagCache(definition)

  await serviceClient.from('feature_flag_audit').insert({
    flag_id: data.id,
    flag_key: data.flag_key,
    previous_enabled: existing.enabled ?? false,
    new_enabled: definition.enabled,
    changed_by: profile.id,
    changed_by_role: 'admin',
    reason: reason ?? 'updated',
    metadata: {
      reason: reason ?? 'updated',
      owner: definition.owner,
    },
  })

  const flags = await buildAdminFlagSet([data])
  const record =
    flags.find((entry) => entry.flagKey === data.flag_key) ??
    mapToAdminRecord(definition, {
      id: data.id,
      createdBy: data.created_by ?? null,
      updatedBy: data.updated_by ?? null,
      persisted: true,
    })

  return NextResponse.json({
    flag: record,
    message: 'Feature flag updated successfully.',
  })
}

export async function PURGE() {
  invalidateFeatureFlagCache()
  return NextResponse.json({ message: 'Feature flag cache cleared.' })
}
