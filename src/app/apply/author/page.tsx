import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthorApplicationForm } from '@/components/community/AuthorApplicationForm'
import { createServerComponentClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

const perks = [
  {
    title: 'Editorial partnership',
    description: 'Dedicated editor feedback, collaborative revisions, and launch planning for every accepted draft.',
  },
  {
    title: 'Amplified reach',
    description: 'Distribution across Syntax & Sips newsletters, social playlists, and topic hubs reaching thousands of readers.',
  },
  {
    title: 'Creator tooling',
    description: 'Access to the contributor studio with autosave, revision history, and publishing analytics tuned for MDX storytelling.',
  },
  {
    title: 'Community perks',
    description: 'Private Discord channel, streaming invites, and seasonal drop-in salons to jam on experiments with fellow makers.',
  },
]

const journey = [
  {
    step: '1. Apply',
    copy: 'Share your focus areas, portfolio, and availability. We respond within 7 business days.',
  },
  {
    step: '2. Draft & collaborate',
    copy: 'Once approved you gain access to the creator workspace for structured metadata, MDX editing, and editor chats.',
  },
  {
    step: '3. Publish & celebrate',
    copy: 'Approved drafts flow into the Syntax & Sips editorial calendar with promotion slots across the platform.',
  },
]

const focusPillars = [
  'Machine Learning',
  'Data Science',
  'Quantum Computing',
  'Coding Tutorials',
  'Video & Livestreams',
  'Indie + AAA Gaming',
]

export default async function AuthorApplyPage() {
  const supabase = createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/apply/author')
  }

  const profileResponse = await supabase
    .from('profiles')
    .select('id, display_name, pronouns')
    .eq('user_id', user.id)
    .maybeSingle()

  type ProfileRecord = {
    id: string
    display_name: string | null
    pronouns?: string | null
  }

  let profile = profileResponse.data as ProfileRecord | null

  if (profileResponse.error) {
    const missingPronounsColumn =
      profileResponse.error.code === '42703' ||
      Boolean(
        profileResponse.error.message
          ?.toLowerCase()
          .includes('profiles.pronouns'),
      )

    if (!missingPronounsColumn) {
      throw new Error(`Unable to load profile: ${profileResponse.error.message}`)
    }

    const fallbackResponse = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (fallbackResponse.error) {
      throw new Error(`Unable to load profile: ${fallbackResponse.error.message}`)
    }

    profile = fallbackResponse.data
      ? ({ ...fallbackResponse.data, pronouns: null } as ProfileRecord)
      : null
  }

  if (!profile) {
    throw new Error('Profile not found for current user.')
  }

  const { data: application } = await supabase
    .from('author_applications')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? null

  const currentStatus = application?.status as string | undefined

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl border-4 border-[#121212] bg-[#FEE8D6] p-10 shadow-[12px_12px_0px_#121212]">
        <p className="inline-flex items-center rounded-full border-4 border-[#121212] bg-white px-4 py-1 text-sm font-black uppercase tracking-widest text-[#121212] shadow-[4px_4px_0px_#121212]">
          Community Author Program
        </p>
        <h1 className="mt-6 text-4xl font-black uppercase leading-tight tracking-tight text-[#121212] sm:text-5xl">
          Brew Your Voice Into Syntax &amp; Sips
        </h1>
        <p className="mt-6 max-w-2xl text-lg font-semibold text-[#2F2F2F]">
          Share your AI, ML, dev, or gaming insights with a community that loves thoughtful tech conversations. Our editorial
          team partners with you from pitch to publication—so you can focus on crafting stories worth sipping.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="#application"
            className="inline-flex items-center justify-center rounded-2xl border-4 border-[#121212] bg-[#121212] px-6 py-3 text-lg font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_#FFCF56] transition hover:-translate-y-1"
          >
            Apply to become an author
          </a>
          <Link
            href="/docs/author-guidelines"
            className="inline-flex items-center justify-center rounded-2xl border-4 border-[#121212] bg-white px-6 py-3 text-lg font-black uppercase tracking-wide text-[#121212] shadow-[6px_6px_0px_#6C63FF] transition hover:-translate-y-1"
          >
            View author guidelines
          </Link>
        </div>
        {currentStatus ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-xl border-4 border-[#6C63FF] bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-[#121212] shadow-[4px_4px_0px_#6C63FF]">
            Current status: <span className="rounded bg-[#6C63FF] px-2 py-1 text-white">{currentStatus.replace(/_/g, ' ')}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        <div className="space-y-8">
          <div className="rounded-3xl border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]">
            <h2 className="text-2xl font-black uppercase text-[#121212]">Why contribute</h2>
            <p className="mt-4 text-base font-semibold text-[#3B3B3B]">
              Syntax &amp; Sips is a collaborative brew of technologists, storytellers, and curious gamers. When you submit a draft,
              you tap into a dedicated editorial squad, bespoke design support, and a readership hungry for thoughtful explainers.
            </p>
            <ul className="mt-6 space-y-4">
              {perks.map((perk) => (
                <li
                  key={perk.title}
                  className="rounded-2xl border-4 border-[#121212] bg-[#F7F4F0] px-4 py-3 text-sm font-semibold text-[#121212] shadow-[4px_4px_0px_#121212]"
                >
                  <p className="font-black uppercase text-[#6C63FF]">{perk.title}</p>
                  <p className="mt-2 text-[#2F2F2F]">{perk.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border-4 border-[#121212] bg-[#E7F5FF] p-6 shadow-[8px_8px_0px_#121212]">
            <h3 className="text-xl font-black uppercase text-[#121212]">What we publish</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {focusPillars.map((pillar) => (
                <span
                  key={pillar}
                  className="inline-flex items-center rounded-full border-4 border-[#121212] bg-white px-4 py-2 text-sm font-black uppercase text-[#121212] shadow-[3px_3px_0px_#121212]"
                >
                  {pillar}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl border-4 border-[#121212] bg-[#121212] p-6 text-white shadow-[8px_8px_0px_#FFCF56]">
          <h3 className="text-xl font-black uppercase">The author journey</h3>
          <ul className="mt-6 space-y-4">
            {journey.map((step) => (
              <li key={step.step} className="rounded-2xl border-4 border-white/70 bg-white/10 px-4 py-3 shadow-[4px_4px_0px_#FFCF56]">
                <p className="font-black uppercase text-[#FFCF56]">{step.step}</p>
                <p className="mt-2 text-sm font-semibold text-white/90">{step.copy}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-semibold text-white/80">
            Approved contributors unlock the <span className="font-black text-white">creator workspace</span> to draft in MDX, manage
            metadata, and collaborate with editors—all with autosave, revision history, and compliance guardrails baked in.
          </p>
        </div>
      </div>

      <div id="application" className="mt-20">
        <h2 className="text-3xl font-black uppercase text-[#121212]">Apply to become an author</h2>
        <p className="mt-4 max-w-2xl text-base font-semibold text-[#3B3B3B]">
          Complete the application to share your expertise, focus areas, and storytelling goals. We review every submission with a
          human in the loop and respond within a week.
        </p>
        <AuthorApplicationForm
          profile={{
            fullName: profile.display_name ?? user.email ?? 'Creator',
            email: user.email ?? '',
            pronouns: profile.pronouns ?? undefined,
          }}
          existingApplication={application ?? null}
          hcaptchaSiteKey={hcaptchaSiteKey}
        />
      </div>
    </section>
  )
}
