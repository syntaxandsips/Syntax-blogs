import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { beforeAll, describe, expect, test } from 'vitest'

const supabaseUrl =
  process.env.RBAC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const supabaseAnonKey =
  process.env.RBAC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey =
  process.env.RBAC_SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

const roleTokens = {
  member: process.env.RBAC_TEST_MEMBER_JWT,
  contributor: process.env.RBAC_TEST_CONTRIBUTOR_JWT,
  organizer: process.env.RBAC_TEST_ORGANIZER_JWT,
  moderator: process.env.RBAC_TEST_MODERATOR_JWT,
  admin: process.env.RBAC_TEST_ADMIN_JWT,
} as const

type CanonicalRole = keyof typeof roleTokens

interface RoleClient {
  slug: CanonicalRole
  jwt: string
  client: SupabaseClient
  profileId: string
  userId: string
}

interface TestContext {
  spaceId: string
  spaceSlug: string
  spaceRuleId: string
  contributorPostId: string
  moderatorPostId: string
  commentId: string
  reportId: string
  featureFlagId: string
  roleProfiles: Record<CanonicalRole, string>
  serviceClient: SupabaseClient
}

const hasCredentials =
  Boolean(supabaseUrl && supabaseAnonKey && serviceRoleKey) &&
  (Object.values(roleTokens) as Array<string | undefined>).every(Boolean)

const decodeUserId = (jwt: string): string => {
  const [, payload] = jwt.split('.')
  if (!payload) {
    throw new Error('Invalid JWT payload segment')
  }
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string }
  if (!decoded.sub) {
    throw new Error('JWT missing subject')
  }
  return decoded.sub
}

describe('rbac policy enforcement (requires Supabase test credentials)', () => {
  const describeWithCreds = hasCredentials ? describe : describe.skip

  describeWithCreds('role × action × table matrix', () => {
    const context: Partial<TestContext> = {}
    const roleClients: RoleClient[] = []
    const suffix = crypto.randomUUID().slice(0, 8)

    beforeAll(async () => {
      if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
        throw new Error('Missing Supabase base credentials')
      }

      const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
      })
      context.serviceClient = serviceClient

      const { data: roles, error: roleError } = await serviceClient
        .from('roles')
        .select('id, slug')
      if (roleError || !roles) {
        throw roleError ?? new Error('Unable to load roles table')
      }
      const roleIdBySlug = new Map<string, string>(roles.map((role) => [role.slug, role.id]))

      const ensureProfileForRole = async (
        slug: CanonicalRole,
        jwt: string,
      ): Promise<{ profileId: string; userId: string }> => {
        const userId = decodeUserId(jwt)
        const { data: existingProfile } = await serviceClient
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle()

        const profileId = existingProfile?.id ?? crypto.randomUUID()

        if (!existingProfile) {
          const { error: upsertProfileError } = await serviceClient
            .from('profiles')
            .upsert(
              {
                id: profileId,
                user_id: userId,
                display_name: `rbac-${slug}-${suffix}`,
                is_admin: slug === 'admin',
              },
              { onConflict: 'id' },
            )
          if (upsertProfileError) {
            throw upsertProfileError
          }
        }

        const requiredRoleId = roleIdBySlug.get(slug)
        if (!requiredRoleId) {
          throw new Error(`Role ID missing for ${slug}`)
        }

        const { error: profileRoleError } = await serviceClient
          .from('profile_roles')
          .upsert(
            {
              profile_id: profileId,
              role_id: requiredRoleId,
            },
            { onConflict: 'profile_id,role_id' },
          )
        if (profileRoleError) {
          throw profileRoleError
        }

        return { profileId, userId }
      }

      const roleProfileMap: Record<CanonicalRole, string> = {
        member: '',
        contributor: '',
        organizer: '',
        moderator: '',
        admin: '',
      }

      for (const [slug, jwt] of Object.entries(roleTokens) as Array<[CanonicalRole, string | undefined]>) {
        if (!jwt) {
          throw new Error(`Missing JWT for ${slug}`)
        }
        const { profileId, userId } = await ensureProfileForRole(slug, jwt)
        roleProfileMap[slug] = profileId

        const anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
        await anonClient.auth.setSession({ access_token: jwt, refresh_token: '' })
        roleClients.push({ slug, jwt, client: anonClient, profileId, userId })
      }

      const spaceSlug = `rbac-space-${suffix}`
      const { data: space, error: spaceError } = await serviceClient
        .from('spaces')
        .insert({
          slug: spaceSlug,
          name: `RBAC Test Space ${suffix}`,
          visibility: 'private',
        })
        .select('id')
        .single()
      if (spaceError || !space) {
        throw spaceError ?? new Error('Failed to create test space')
      }

      context.spaceId = space.id
      context.spaceSlug = spaceSlug

      const membershipStatus = 'active'
      for (const [slug, profileId] of Object.entries(roleProfileMap) as Array<[CanonicalRole, string]>) {
        const roleId = roleIdBySlug.get(slug)
        if (!roleId) {
          throw new Error(`Missing role id for ${slug}`)
        }
        const { error: memberUpsertError } = await serviceClient
          .from('space_members')
          .upsert(
            {
              space_id: space.id,
              profile_id: profileId,
              role_id: roleId,
              status: membershipStatus,
            },
            { onConflict: 'space_id,profile_id' },
          )
        if (memberUpsertError) {
          throw memberUpsertError
        }
      }

      const { data: rule, error: ruleError } = await serviceClient
        .from('space_rules')
        .insert({
          space_id: space.id,
          title: 'RBAC Integration Rule',
          body: 'No spoilers before launch',
        })
        .select('id')
        .single()
      if (ruleError || !rule) {
        throw ruleError ?? new Error('Failed to seed space rule')
      }
      context.spaceRuleId = rule.id

      const { data: contributorPost, error: contributorPostError } = await serviceClient
        .from('posts')
        .insert({
          title: 'RBAC Contributor Draft',
          slug: `rbac-contributor-${suffix}`,
          content: 'draft content',
          status: 'draft',
          space_id: space.id,
          author_id: roleProfileMap.contributor,
        })
        .select('id')
        .single()
      if (contributorPostError || !contributorPost) {
        throw contributorPostError ?? new Error('Failed to seed contributor post')
      }
      context.contributorPostId = contributorPost.id

      const { data: moderatorPost, error: moderatorPostError } = await serviceClient
        .from('posts')
        .insert({
          title: 'RBAC Moderator Draft',
          slug: `rbac-moderator-${suffix}`,
          content: 'moderator draft',
          status: 'draft',
          space_id: space.id,
          author_id: roleProfileMap.moderator,
        })
        .select('id')
        .single()
      if (moderatorPostError || !moderatorPost) {
        throw moderatorPostError ?? new Error('Failed to seed moderator post')
      }
      context.moderatorPostId = moderatorPost.id

      const { error: versionInsertError } = await serviceClient.from('post_versions').insert({
        post_id: contributorPost.id,
        version_number: 1,
        content: { body: 'initial version' },
        metadata: { status: 'draft' },
        created_by: roleProfileMap.contributor,
      })
      if (versionInsertError) {
        throw versionInsertError
      }

      const { data: comment, error: commentError } = await serviceClient
        .from('comments')
        .insert({
          post_id: contributorPost.id,
          author_profile_id: roleProfileMap.member,
          body: 'rbac test comment',
          status: 'approved',
        })
        .select('id')
        .single()
      if (commentError || !comment) {
        throw commentError ?? new Error('Failed to seed comment')
      }
      context.commentId = comment.id

      const { data: report, error: reportError } = await serviceClient
        .from('reports')
        .insert({
          subject_type: 'post',
          subject_id: contributorPost.id,
          reason: 'rbac smoke',
          space_id: space.id,
        })
        .select('id')
        .single()
      if (reportError || !report) {
        throw reportError ?? new Error('Failed to seed report')
      }
      context.reportId = report.id

      const { data: flag, error: flagError } = await serviceClient
        .from('feature_flags')
        .select('id')
        .eq('flag_key', 'rbac_hardening_v1')
        .single()
      if (flagError || !flag) {
        throw flagError ?? new Error('Expected rbac_hardening_v1 flag to exist')
      }
      context.featureFlagId = flag.id
      context.roleProfiles = roleProfileMap
    })

    const expectOperation = async (
      role: RoleClient,
      operation: () => Promise<boolean>,
      expected: boolean,
      actionLabel: string,
    ) => {
      const result = await operation()
      expect(result).toBe(
        expected,
        `Expected ${role.slug} to ${expected ? 'succeed' : 'fail'} for ${actionLabel}`,
      )
    }

    test('spaces policies enforce organizer/admin management', async () => {
      const ctx = context as TestContext
      for (const role of roleClients) {
        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('spaces')
              .select('id')
              .eq('id', ctx.spaceId)
              .maybeSingle()
            return !error
          },
          true,
          'spaces.select',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('spaces')
              .update({ description: `updated-${role.slug}` })
              .eq('id', ctx.spaceId)
            if (!error) {
              await ctx.serviceClient
                .from('spaces')
                .update({ description: null })
                .eq('id', ctx.spaceId)
            }
            return !error
          },
          ['organizer', 'moderator', 'admin'].includes(role.slug),
          'spaces.update',
        )

        await expectOperation(
          role,
          async () => {
            const slug = `rbac-insert-${role.slug}-${crypto.randomUUID().slice(0, 4)}`
            const { error } = await role.client.from('spaces').insert({
              slug,
              name: `RBAC Insert ${role.slug}`,
              visibility: 'private',
            })
            if (!error) {
              await ctx.serviceClient.from('spaces').delete().eq('slug', slug)
            }
            return !error
          },
          ['organizer', 'moderator', 'admin'].includes(role.slug),
          'spaces.insert',
        )
      }
    })

    test('space membership and rules respect organizer threshold', async () => {
      const ctx = context as TestContext
      for (const role of roleClients) {
        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('space_members')
              .select('profile_id')
              .eq('space_id', ctx.spaceId)
              .maybeSingle()
            return !error
          },
          true,
          'space_members.select',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('space_members')
              .update({ status: 'active' })
              .eq('space_id', ctx.spaceId)
              .eq('profile_id', ctx.roleProfiles.member)
            return !error
          },
          ['organizer', 'moderator', 'admin'].includes(role.slug),
          'space_members.update',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('space_rules')
              .update({ title: `Rule ${role.slug}` })
              .eq('id', ctx.spaceRuleId)
            if (!error) {
              await ctx.serviceClient
                .from('space_rules')
                .update({ title: 'RBAC Integration Rule' })
                .eq('id', ctx.spaceRuleId)
            }
            return !error
          },
          ['organizer', 'moderator', 'admin'].includes(role.slug),
          'space_rules.update',
        )
      }
    })

    test('post policies honor contributor, moderator, and organizer scopes', async () => {
      const ctx = context as TestContext
      for (const role of roleClients) {
        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('posts')
              .select('id')
              .eq('id', ctx.contributorPostId)
              .maybeSingle()
            return !error
          },
          true,
          'posts.select',
        )

        await expectOperation(
          role,
          async () => {
            const slug = `rbac-post-${role.slug}-${crypto.randomUUID().slice(0, 4)}`
            const { error } = await role.client.from('posts').insert({
              title: `Draft by ${role.slug}`,
              slug,
              content: 'rbac integration insert',
              status: 'draft',
              space_id: ctx.spaceId,
              author_id: role.profileId,
            })
            if (!error) {
              await ctx.serviceClient.from('posts').delete().eq('slug', slug)
            }
            return !error
          },
          ['contributor', 'organizer', 'moderator', 'admin'].includes(role.slug),
          'posts.insert',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('posts')
              .update({ excerpt: `updated-${role.slug}` })
              .eq('id', ctx.contributorPostId)
            if (!error) {
              await ctx.serviceClient
                .from('posts')
                .update({ excerpt: null })
                .eq('id', ctx.contributorPostId)
            }
            return !error
          },
          ['contributor', 'organizer', 'moderator', 'admin'].includes(role.slug),
          'posts.update',
        )

        await expectOperation(
          role,
          async () => {
            const slug = `rbac-delete-${role.slug}-${crypto.randomUUID().slice(0, 4)}`
            const { data, error: seedError } = await ctx.serviceClient
              .from('posts')
              .insert({
                title: `Delete candidate ${role.slug}`,
                slug,
                content: 'rbac delete candidate',
                status: 'draft',
                space_id: ctx.spaceId,
                author_id: ctx.roleProfiles.contributor,
              })
              .select('id')
              .single()
            if (seedError || !data) {
              throw seedError ?? new Error('Failed to seed delete candidate post')
            }
            const { error } = await role.client.from('posts').delete().eq('id', data.id)
            if (error) {
              await ctx.serviceClient.from('posts').delete().eq('id', data.id)
            }
            return !error
          },
          ['contributor', 'organizer', 'moderator', 'admin'].includes(role.slug),
          'posts.delete',
        )
      }
    })

    test('post versions and comments obey escalated privileges', async () => {
      const ctx = context as TestContext
      for (const role of roleClients) {
        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('post_versions')
              .select('id')
              .eq('post_id', ctx.contributorPostId)
              .maybeSingle()
            return !error
          },
          ['contributor', 'organizer', 'moderator', 'admin'].includes(role.slug),
          'post_versions.select',
        )

        await expectOperation(
          role,
          async () => {
            const { data, error } = await role.client
              .from('comments')
              .insert({
                post_id: ctx.contributorPostId,
                author_profile_id: role.profileId,
                body: `comment from ${role.slug}`,
                status: 'pending',
              })
              .select('id')
              .single()
            if (!error && data?.id) {
              await ctx.serviceClient.from('comments').delete().eq('id', data.id)
            }
            return !error
          },
          ['member', 'contributor', 'organizer', 'moderator', 'admin'].includes(role.slug),
          'comments.insert',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('comments')
              .delete()
              .eq('id', ctx.commentId)
            if (error) {
              await ctx.serviceClient
                .from('comments')
                .update({ status: 'approved' })
                .eq('id', ctx.commentId)
            } else {
              await ctx.serviceClient
                .from('comments')
                .insert({
                  id: ctx.commentId,
                  post_id: ctx.contributorPostId,
                  author_profile_id: ctx.roleProfiles.member,
                  body: 'rbac test comment',
                  status: 'approved',
                })
            }
            return !error
          },
          ['organizer', 'moderator', 'admin'].includes(role.slug),
          'comments.delete',
        )
      }
    })

    test('reports, audit logs, and feature flags restricted to moderators/admins', async () => {
      const ctx = context as TestContext
      for (const role of roleClients) {
        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('reports')
              .select('id')
              .eq('id', ctx.reportId)
              .maybeSingle()
            return !error
          },
          ['moderator', 'admin'].includes(role.slug),
          'reports.select',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client.from('audit_logs').select('id').limit(1)
            return !error
          },
          role.slug === 'admin',
          'audit_logs.select',
        )

        await expectOperation(
          role,
          async () => {
            const { error } = await role.client
              .from('feature_flags')
              .update({ description: `rbac-${role.slug}` })
              .eq('id', ctx.featureFlagId)
            if (!error) {
              await ctx.serviceClient
                .from('feature_flags')
                .update({ description: 'RBAC Hardening rollout' })
                .eq('id', ctx.featureFlagId)
            }
            return !error
          },
          role.slug === 'admin',
          'feature_flags.update',
        )
      }
    })
  })
})
