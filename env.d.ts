declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    NEXT_PUBLIC_SITE_URL?: string
    NEXT_PUBLIC_VERCEL_URL?: string
    VERCEL_URL?: string
    MAILTRAP_HOST?: string
    MAILTRAP_PORT?: string
    MAILTRAP_USER?: string
    MAILTRAP_PASS?: string
    MAILTRAP_FROM_EMAIL?: string
    MAILTRAP_FROM_NAME?: string
    UPSTASH_REDIS_REST_URL?: string
    UPSTASH_REDIS_REST_TOKEN?: string
  }
}
