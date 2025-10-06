import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local (or fall back to .env)
const projectRoot = path.resolve(__dirname, '..')
const envFiles = ['.env.local', '.env']

let envLoaded = false
let envLoadedFrom: string | null = null
for (const envFile of envFiles) {
  const envPath = path.join(projectRoot, envFile)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    envLoaded = true
    envLoadedFrom = envPath
    break
  }
}

if (!envLoaded) {
  dotenv.config()
  console.warn(
    'No .env.local or .env file found in the project root. Falling back to system environment variables.'
  )
} else if (envLoadedFrom) {
  console.log(`Loaded environment variables from ${path.relative(projectRoot, envLoadedFrom)}`)
}

const TEST_USER_EMAIL = 'test.admin@syntaxblogs.dev'
const TEST_USER_PASSWORD = 'TestAdmin123!'
const TEST_USER_DISPLAY_NAME = 'SyntaxBlogs Test Admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug: Log environment variables (remove in production)
console.log('Environment variables loaded:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '***' : 'Not found')
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '***' : 'Not found')

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable.')
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

type AdminUser = {
  id: string
  email: string
}

async function fetchExistingUser(): Promise<AdminUser | null> {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (error) {
    throw new Error(`Unable to list Supabase users: ${error.message}`)
  }

  const users = data?.users ?? []
  const existing = users.find((user) => user.email?.toLowerCase() === TEST_USER_EMAIL)
  if (!existing) {
    return null
  }

  return {
    id: existing.id,
    email: existing.email ?? TEST_USER_EMAIL,
  }
}

async function ensureAuthUser(): Promise<AdminUser> {
  const existing = await fetchExistingUser()

  if (!existing) {
    console.log('Creating admin auth user…')
    const { data, error } = await supabase.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: TEST_USER_DISPLAY_NAME,
      },
    })

    if (error || !data.user) {
      throw new Error(`Failed to create admin user: ${error?.message ?? 'Unknown error'}`)
    }

    return { id: data.user.id, email: TEST_USER_EMAIL }
  }

  console.log('Admin auth user exists. Refreshing password & metadata…')
  const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
    password: TEST_USER_PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: TEST_USER_DISPLAY_NAME,
    },
  })

  if (error || !data.user) {
    throw new Error(`Failed to refresh admin user: ${error?.message ?? 'Unknown error'}`)
  }

  return { id: data.user.id, email: data.user.email ?? TEST_USER_EMAIL }
}

async function ensureProfile(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, primary_role_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to look up profile: ${error.message}`)
  }

  if (!profile) {
    console.log('Creating admin profile…')
    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        display_name: TEST_USER_DISPLAY_NAME,
        is_admin: true,
      })
      .select('id, primary_role_id')
      .single()

    if (insertError) {
      throw new Error(`Failed to create admin profile: ${insertError.message}`)
    }

    return inserted
  }

  console.log('Updating existing admin profile…')
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      display_name: TEST_USER_DISPLAY_NAME,
      is_admin: true,
    })
    .eq('id', profile.id)
    .select('id, primary_role_id')
    .single()

  if (updateError) {
    throw new Error(`Failed to update admin profile: ${updateError.message}`)
  }

  return updated
}

async function ensureAdminRole(profileId: string) {
  const { data: adminRole, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('slug', 'admin')
    .single()

  if (roleError || !adminRole) {
    throw new Error(`Failed to fetch admin role: ${roleError?.message ?? 'Role missing'}`)
  }

  const { data: membership, error: membershipError } = await supabase
    .from('profile_roles')
    .select('profile_id')
    .eq('profile_id', profileId)
    .eq('role_id', adminRole.id)
    .maybeSingle()

  if (membershipError) {
    throw new Error(`Failed to check profile role membership: ${membershipError.message}`)
  }

  if (!membership) {
    console.log('Linking profile to admin role…')
    const { error: insertError } = await supabase.from('profile_roles').insert({
      profile_id: profileId,
      role_id: adminRole.id,
    })

    if (insertError) {
      throw new Error(`Failed to assign admin role: ${insertError.message}`)
    }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ primary_role_id: adminRole.id })
    .eq('id', profileId)

  if (updateError) {
    throw new Error(`Failed to set primary admin role: ${updateError.message}`)
  }
}

async function main() {
  console.log('Seeding SyntaxBlogs admin user…')
  const user = await ensureAuthUser()
  const profile = await ensureProfile(user.id)
  await ensureAdminRole(profile.id)
  console.log('✅ Test admin account ready:')
  console.log(`   Email:    ${TEST_USER_EMAIL}`)
  console.log(`   Password: ${TEST_USER_PASSWORD}`)
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
