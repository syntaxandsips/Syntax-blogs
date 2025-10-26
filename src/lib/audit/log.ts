import { createServiceRoleClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'

export interface AuditLogEntry {
  actorId?: string | null
  actorRole: string
  resource: string
  action: string
  entityId?: string | null
  spaceId?: string | null
  reason?: string | null
  metadata?: Record<string, unknown>
}

const serializeMetadata = (metadata?: Record<string, unknown>) => metadata ?? {}

export const writeAuditLog = async (entry: AuditLogEntry) => {
  try {
    const serviceClient = createServiceRoleClient<Database>()

    const { error } = await serviceClient
      .from('audit_logs')
      .insert({
        actor_id: entry.actorId ?? null,
        actor_role: entry.actorRole,
        resource: entry.resource,
        action: entry.action,
        entity_id: entry.entityId ?? null,
        space_id: entry.spaceId ?? null,
        metadata: serializeMetadata(entry.metadata),
        reason: entry.reason ?? null,
      })

    if (error) {
      console.error('[audit_log] failed to persist entry', {
        error: error.message,
        resource: entry.resource,
        action: entry.action,
      })
    }
  } catch (error) {
    console.error('[audit_log] unexpected failure', {
      error,
      resource: entry.resource,
      action: entry.action,
    })
  }
}
