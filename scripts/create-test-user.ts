import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const TEST_USER_EMAIL = 'test.admin@syntaxblogs.dev'
const TEST_USER_PASSWORD = 'TestAdmin123!'
const TEST_USER_DISPLAY_NAME = 'SyntaxBlogs Test Admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

async function ensureTestUser() {
  const { data: existingUser, error: fetchError } = await supabase.auth.admin.getUserByEmail(TEST_USER_EMAIL)

  if (fetchError) {
    throw new Error(`Failed to look up existing test user: ${fetchError.message}`)
  }

  if (existingUser?.user) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.user.id, {
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    })

    if (updateError) {
      throw new Error(`Failed to update existing test user credentials: ${updateError.message}`)
    }

    await ensureProfile(existingUser.user.id)
    return existingUser.user.id
  }

  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
    email_confirm: true,
  })

  if (createError || !createdUser?.user) {
    throw new Error(createError?.message ?? 'Unable to create test user.')
  }

  await ensureProfile(createdUser.user.id)
  return createdUser.user.id
}

async function ensureProfile(userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_admin, display_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to load profile for test user: ${profileError.message}`)
  }

  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: userId,
      display_name: TEST_USER_DISPLAY_NAME,
      is_admin: true,
    })

    if (insertError) {
      throw new Error(`Failed to insert profile for test user: ${insertError.message}`)
    }
    return
  }

  if (!profile.is_admin) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name ?? TEST_USER_DISPLAY_NAME,
        is_admin: true,
      })
      .eq('id', profile.id)

    if (updateError) {
      throw new Error(`Failed to promote test user profile to admin: ${updateError.message}`)
    }
  }
}

async function main() {
  try {
    const userId = await ensureTestUser()
    console.log('Test admin user is ready.')
    console.log(`Email:    ${TEST_USER_EMAIL}`)
    console.log(`Password: ${TEST_USER_PASSWORD}`)
    console.log(`Supabase user id: ${userId}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

void main()
