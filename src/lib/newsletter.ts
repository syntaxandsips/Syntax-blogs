import crypto from 'node:crypto'

import { createServiceRoleClient } from './supabase/server-client'

type SubscriberRecord = {
  id: string
  email: string
  confirmed: boolean
  confirmed_at: string | null
  unsubscribed_at: string | null
  metadata: Record<string, unknown> | null
}

type UpsertMetadata = {
  userAgent?: string | null
  referer?: string | null
}

const TOKEN_BYTES = 32
const TOKEN_TTL_HOURS = 48

const tableName = 'newsletter_subscribers'

const generateToken = () => crypto.randomBytes(TOKEN_BYTES).toString('hex')

const calculateExpiry = () =>
  new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()

export type SaveSubscriberResult = {
  token: string
  wasResent: boolean
}

export const saveSubscriber = async (
  email: string,
  source: string,
  metadata: UpsertMetadata = {},
): Promise<SaveSubscriberResult> => {
  const supabase = createServiceRoleClient()

  const normalizedEmail = email.trim().toLowerCase()
  const token = generateToken()
  const tokenExpiresAt = calculateExpiry()

  const { data: existingData, error: fetchError } = await supabase
    .from(tableName)
    .select('id, confirmed, confirmed_at, unsubscribed_at, metadata')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Unable to check existing subscriber: ${fetchError.message}`)
  }

  const existing = existingData as SubscriberRecord | null

  const payload = {
    email: normalizedEmail,
    source,
    confirmation_token: token,
    confirmation_token_expires_at: tokenExpiresAt,
    confirmed: false,
    confirmed_at: null,
    unsubscribed_at: null,
    metadata: {
      ...(existing?.metadata ?? {}),
      last_source: source,
      user_agent: metadata.userAgent ?? null,
      referer: metadata.referer ?? null,
      updated_at: new Date().toISOString(),
    },
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from(tableName)
      .update(payload)
      .eq('id', existing.id)

    if (updateError) {
      throw new Error(`Unable to refresh subscriber: ${updateError.message}`)
    }

    return { token, wasResent: true }
  }

  const { error: insertError } = await supabase.from(tableName).insert({
    ...payload,
    metadata: {
      ...payload.metadata,
      first_source: source,
      subscribed_at_client: new Date().toISOString(),
    },
  })

  if (insertError) {
    throw new Error(`Unable to save subscriber: ${insertError.message}`)
  }

  return { token, wasResent: false }
}

type ConfirmSubscriberResult = 'confirmed' | 'expired' | 'not-found'

export const confirmSubscriber = async (
  email: string,
  token: string,
): Promise<ConfirmSubscriberResult> => {
  const supabase = createServiceRoleClient()
  const normalizedEmail = email.trim().toLowerCase()

  const { data: recordData, error: fetchError } = await supabase
    .from(tableName)
    .select(
      'id, confirmation_token, confirmation_token_expires_at, confirmed, confirmed_at, unsubscribed_at',
    )
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (fetchError) {
    throw new Error(`Unable to lookup subscriber: ${fetchError.message}`)
  }

  const record = recordData as (SubscriberRecord & {
    confirmation_token: string | null
    confirmation_token_expires_at: string | null
  }) | null

  if (!record || !record.confirmation_token) {
    return 'not-found'
  }

  if (record.confirmation_token !== token) {
    return 'not-found'
  }

  const expiry = record.confirmation_token_expires_at
    ? new Date(record.confirmation_token_expires_at).getTime()
    : undefined

  if (expiry && expiry < Date.now()) {
    return 'expired'
  }

  const { error: updateError } = await supabase
    .from(tableName)
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      confirmation_token: null,
      confirmation_token_expires_at: null,
      unsubscribed_at: null,
    })
    .eq('id', record.id)

  if (updateError) {
    throw new Error(`Unable to confirm subscriber: ${updateError.message}`)
  }

  return 'confirmed'
}

type UnsubscribeResult = 'ok' | 'missing'

export const unsubscribeSubscriber = async (
  email: string,
): Promise<UnsubscribeResult> => {
  const supabase = createServiceRoleClient()
  const normalizedEmail = email.trim().toLowerCase()

  const { data: recordData, error } = await supabase
    .from(tableName)
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to locate subscriber: ${error.message}`)
  }

  const record = recordData as SubscriberRecord | null

  if (!record) {
    return 'missing'
  }

  const { error: updateError } = await supabase
    .from(tableName)
    .update({ unsubscribed_at: new Date().toISOString(), confirmed: false })
    .eq('id', record.id)

  if (updateError) {
    throw new Error(`Unable to unsubscribe: ${updateError.message}`)
  }

  return 'ok'
}
