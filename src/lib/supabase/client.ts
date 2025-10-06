import { createClient } from '@supabase/supabase-js'

type ClientOptions = Parameters<typeof createClient>[2]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
}

const defaultOptions: ClientOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
}

export const createBrowserClient = () =>
  createClient(supabaseUrl, supabaseAnonKey, defaultOptions)
