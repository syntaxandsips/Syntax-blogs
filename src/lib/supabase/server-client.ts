import { createClient } from '@supabase/supabase-js'
import {
  createServerClient as createSupabaseServerClient,
  type CookieMethodsServerDeprecated,
  type CookieOptions,
} from '@supabase/ssr'
import { cookies } from 'next/headers'

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

const createCookieAdapter = (): CookieMethodsServerDeprecated => {
  const cookieStore = cookies()

  return {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options?: CookieOptions) {
      cookieStore.set({
        name,
        value,
        ...(options ?? {}),
      })
    },
    remove(name: string, options?: CookieOptions) {
      cookieStore.delete(name)
      void options
    },
  }
}

export const createServerClient = () =>
  createSupabaseServerClient(supabaseUrl, supabaseServiceKey, {
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

export const createServerComponentClient = () =>
  createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: createCookieAdapter(),
  })
