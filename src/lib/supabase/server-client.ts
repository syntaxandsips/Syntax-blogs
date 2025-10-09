import { createClient } from '@supabase/supabase-js'
import {
  createServerClient as createSupabaseServerClient,
  type CookieMethodsServer,
} from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

type ClientOptions = Parameters<typeof createClient>[2]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
}

const createCookieAdapter = (): CookieMethodsServer => {
  const cookieStorePromise = cookies()

  return {
    async getAll() {
      const cookieStore = await cookieStorePromise

      return cookieStore.getAll().map(({ name, value }) => ({ name, value }))
    },
    async setAll(cookiesToSet) {
      const cookieStore = await cookieStorePromise

      for (const { name, value, options } of cookiesToSet) {
        if (!value) {
          if (options?.maxAge === 0) {
            cookieStore.set({
              name,
              value,
              ...options,
            })
          } else {
            cookieStore.delete(name)
          }

          continue
        }

        cookieStore.set({
          name,
          value,
          ...(options ?? {}),
        })
      }
    },
  }
}

export const createServerClient = <DB = Database>() =>
  createSupabaseServerClient<DB>(supabaseUrl, supabaseAnonKey, {
    cookies: createCookieAdapter(),
  })

const serviceRoleOptions: ClientOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}

export const createServiceRoleClient = () =>
  createClient(supabaseUrl, supabaseServiceKey, serviceRoleOptions)

export const createServerComponentClient = <DB = Database>() =>
  createSupabaseServerClient<DB>(supabaseUrl, supabaseAnonKey, {
    cookies: createCookieAdapter(),
  })
