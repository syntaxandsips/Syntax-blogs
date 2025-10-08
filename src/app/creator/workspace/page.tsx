import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CreatorWorkspace } from '@/components/community/CreatorWorkspace'
import { createServerComponentClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

export default async function CreatorWorkspacePage() {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/creator/workspace')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Unable to load profile: ${profileError.message}`)
  }

  if (!profile) {
    throw new Error('Profile not found for current user.')
  }

  const { data: contributor } = await supabase
    .from('community_contributors')
    .select('status')
    .eq('profile_id', profile.id)
    .maybeSingle()

  if (!contributor || contributor.status !== 'approved') {
    return (
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-3xl border-4 border-[#121212] bg-[#FFF4E5] p-10 text-center shadow-[12px_12px_0px_#121212]">
          <h1 className="text-4xl font-black uppercase text-[#121212]">Contributor access pending</h1>
          <p className="mt-6 text-base font-semibold text-[#3B3B3B]">
            Thanks for applying to the Syntax &amp; Sips community author program! Our editors are reviewing your application. Once
            approved, you&apos;ll unlock the creator workspace to craft drafts, collaborate, and publish.
          </p>
          <p className="mt-4 text-sm font-semibold text-[#4B4B4B]">
            Need to update your submission? Head back to{' '}
            <Link href="/apply/author" className="font-black text-[#6C63FF] underline">
              /apply/author
            </Link>{' '}
            to share additional context.
          </p>
        </div>
      </section>
    )
  }

  const { data: submissions } = await supabase
    .from('community_submissions')
    .select(
      'id, title, summary, slug, categories, tags, content, status, editorial_checklist, metadata, notes, submitted_at, updated_at, feedback, last_autosaved_at',
    )
    .eq('profile_id', profile.id)
    .order('updated_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  const submissionRecords = (submissions ?? []).map((submission) => ({
    id: submission.id as string,
    title: (submission.title as string) ?? '',
    summary: submission.summary as string | null,
    slug: submission.slug as string | null,
    categories: (submission.categories as string[]) ?? [],
    tags: (submission.tags as string[]) ?? [],
    content: (submission.content as string) ?? '',
    status: submission.status as string,
    editorial_checklist: (submission.editorial_checklist as Record<string, boolean> | null) ?? null,
    metadata: (submission.metadata as Record<string, unknown> | null) as {
      canonicalUrl?: string | null
      series?: string | null
      featuredImageUrl?: string | null
    } | null,
    notes: (submission.notes as Record<string, unknown> | null) as { toEditors?: string | null } | null,
    submitted_at: submission.submitted_at as string | null,
    updated_at: submission.updated_at as string | null,
    feedback: submission.feedback as string | null,
    last_autosaved_at: submission.last_autosaved_at as string | null,
  }))

  const categoryOptions = (categories ?? []).map((category) => ({
    id: category.id as string,
    name: category.name as string,
  }))

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl border-4 border-[#121212] bg-[#E8F5FF] p-8 shadow-[12px_12px_0px_#121212]">
        <h1 className="text-4xl font-black uppercase text-[#121212]">Creator workspace</h1>
        <p className="mt-4 text-base font-semibold text-[#3B3B3B]">
          Welcome back, {profile.display_name ?? user.email}! Use the studio to build MDX-rich stories, track editorial feedback,
          and ship content that resonates with the Syntax &amp; Sips community.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#4B4B4B]">
          Autosave keeps your work safe. Complete the checklist before submitting for review.
        </p>
      </div>

      <div className="mt-12">
        <CreatorWorkspace
          profile={{ id: profile.id, displayName: profile.display_name ?? user.email ?? 'Creator' }}
          submissions={submissionRecords}
          categories={categoryOptions}
        />
      </div>
    </section>
  )
}
