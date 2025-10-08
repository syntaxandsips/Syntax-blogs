'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CommunitySubmissionInput } from '@/lib/validation/community'
import { cn, generateSlug } from '@/lib/utils'

interface SubmissionRecord {
  id: string
  title: string
  summary: string | null
  slug: string | null
  categories: string[]
  tags: string[]
  content: string
  status: string
  editorial_checklist: Record<string, boolean> | null
  metadata: {
    canonicalUrl?: string | null
    series?: string | null
    featuredImageUrl?: string | null
  } | null
  notes: {
    toEditors?: string | null
  } | null
  submitted_at: string | null
  updated_at: string | null
  feedback: string | null
  last_autosaved_at: string | null
}

interface CreatorWorkspaceProps {
  profile: {
    id: string
    displayName: string
  }
  submissions: SubmissionRecord[]
  categories: Array<{ id: string; name: string }>
}

interface DraftState {
  id?: string
  title: string
  summary: string
  slug?: string
  categories: string[]
  tags: string[]
  content: string
  notesToEditors?: string
  metadata: {
    canonicalUrl?: string
    series?: string
    featuredImageUrl?: string
  }
  checklist: {
    toneReviewed: boolean
    accessibilityChecked: boolean
    linksVerified: boolean
    assetsIncluded: boolean
    aiDisclosureProvided: boolean
  }
}

const DEFAULT_DRAFT: DraftState = {
  title: '',
  summary: '',
  slug: undefined,
  categories: [],
  tags: [],
  content: '',
  notesToEditors: '',
  metadata: {},
  checklist: {
    toneReviewed: false,
    accessibilityChecked: false,
    linksVerified: false,
    assetsIncluded: false,
    aiDisclosureProvided: false,
  },
}

const statusStyles: Record<string, string> = {
  draft: 'bg-[#FFE082] text-[#4E342E]',
  submitted: 'bg-[#C5CAE9] text-[#1A237E]',
  in_review: 'bg-[#B2EBF2] text-[#004D40]',
  needs_revision: 'bg-[#FFCDD2] text-[#B71C1C]',
  approved: 'bg-[#C8E6C9] text-[#1B5E20]',
  declined: 'bg-[#F8BBD0] text-[#880E4F]',
  withdrawn: 'bg-[#E0E0E0] text-[#424242]',
}

const mapSubmissionToDraft = (submission: SubmissionRecord | undefined): DraftState => {
  if (!submission) {
    return { ...DEFAULT_DRAFT }
  }

  return {
    id: submission.id,
    title: submission.title ?? '',
    summary: submission.summary ?? '',
    slug: submission.slug ?? undefined,
    categories: submission.categories ?? [],
    tags: submission.tags ?? [],
    content: submission.content ?? '',
    notesToEditors: submission.notes?.toEditors ?? '',
    metadata: {
      canonicalUrl: submission.metadata?.canonicalUrl ?? undefined,
      series: submission.metadata?.series ?? undefined,
      featuredImageUrl: submission.metadata?.featuredImageUrl ?? undefined,
    },
    checklist: {
      toneReviewed: submission.editorial_checklist?.toneReviewed ?? false,
      accessibilityChecked: submission.editorial_checklist?.accessibilityChecked ?? false,
      linksVerified: submission.editorial_checklist?.linksVerified ?? false,
      assetsIncluded: submission.editorial_checklist?.assetsIncluded ?? false,
      aiDisclosureProvided: submission.editorial_checklist?.aiDisclosureProvided ?? false,
    },
  }
}

export const CreatorWorkspace = ({ profile, submissions, categories }: CreatorWorkspaceProps) => {
  const [submissionList, setSubmissionList] = useState<SubmissionRecord[]>(submissions)
  const [selectedId, setSelectedId] = useState<string | 'new'>(submissions[0]?.id ?? 'new')
  const [draft, setDraft] = useState<DraftState>(() => mapSubmissionToDraft(submissions[0]))
  const [statusMap, setStatusMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    submissions.forEach((item) => {
      map[item.id] = item.status
    })
    return map
  })
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(submissions[0]?.last_autosaved_at ?? null)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(submissions[0]?.feedback ?? null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setSubmissionList(submissions)
  }, [submissions])

  useEffect(() => {
    setStatusMap((previous) => {
      const next = { ...previous }
      submissionList.forEach((entry) => {
        next[entry.id] = entry.status
      })
      return next
    })
  }, [submissionList])

  useEffect(() => {
    if (selectedId === 'new') {
      setDraft({ ...DEFAULT_DRAFT })
      setFeedback(null)
      return
    }

    const submission = submissionList.find((item) => item.id === selectedId)
    setDraft(mapSubmissionToDraft(submission))
    setFeedback(submission?.feedback ?? null)
    setLastSavedAt(submission?.last_autosaved_at ?? null)
  }, [selectedId, submissionList])

  const submitToApi = useCallback(
    async (intent: CommunitySubmissionInput['intent']) => {
      const payload: CommunitySubmissionInput = {
        id: draft.id,
        title: draft.title,
        summary: draft.summary,
        slug: draft.slug ?? generateSlug(draft.title),
        categories: draft.categories,
        tags: draft.tags,
        content: draft.content,
        notesToEditors: draft.notesToEditors,
        attachments: [],
        coAuthorIds: [],
        metadata: {
          canonicalUrl: draft.metadata.canonicalUrl,
          series: draft.metadata.series,
          featuredImageUrl: draft.metadata.featuredImageUrl,
        },
        checklist: draft.checklist,
        intent,
      }

      const response = await fetch('/api/community/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to save submission.')
      }

      return data
    },
    [draft],
  )

  const autosave = useCallback(async () => {
    if (!draft.title && !draft.content) {
      return
    }

    try {
      setIsSaving(true)
      const result = await submitToApi('autosave')
      setDraft((previous) => ({ ...previous, id: result.submission.id }))
      setLastSavedAt(new Date().toISOString())
      setStatusMap((previous) => ({ ...previous, [result.submission.id]: result.submission.status }))
      setSubmissionList((previous) => {
        const existingIndex = previous.findIndex((entry) => entry.id === result.submission.id)
        const normalized: SubmissionRecord = {
          ...(result.submission as SubmissionRecord),
        }
        if (existingIndex >= 0) {
          const clone = [...previous]
          clone[existingIndex] = normalized
          return clone
        }
        return [normalized, ...previous]
      })
      setSelectedId(result.submission.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Autosave failed')
    } finally {
      setIsSaving(false)
    }
  }, [draft.title, draft.content, submitToApi])

  useEffect(() => {
    const timeout = setTimeout(() => {
      void autosave()
    }, 1800)

    return () => clearTimeout(timeout)
  }, [draft.title, draft.summary, draft.content, draft.notesToEditors, draft.metadata, draft.checklist, autosave])

  const handleSave = async () => {
    setError(null)
    try {
      setIsSaving(true)
      const result = await submitToApi('save')
      setSuccess('Draft saved!')
      setDraft((previous) => ({ ...previous, id: result.submission.id }))
      setStatusMap((previous) => ({ ...previous, [result.submission.id]: result.submission.status }))
      setLastSavedAt(result.submission.updated_at)
      setSubmissionList((previous) => {
        const normalized: SubmissionRecord = {
          ...(result.submission as SubmissionRecord),
        }
        const existingIndex = previous.findIndex((entry) => entry.id === normalized.id)
        if (existingIndex >= 0) {
          const clone = [...previous]
          clone[existingIndex] = normalized
          return clone
        }
        return [normalized, ...previous]
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save draft.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    setError(null)
    setSuccess(null)

    try {
      setIsSaving(true)
      const result = await submitToApi('submit')
      setStatusMap((previous) => ({ ...previous, [result.submission.id]: result.submission.status }))
      setSuccess('Draft submitted for editorial review!')
      setFeedback(null)
      setSubmissionList((previous) => {
        const normalized: SubmissionRecord = {
          ...(result.submission as SubmissionRecord),
        }
        const existingIndex = previous.findIndex((entry) => entry.id === normalized.id)
        if (existingIndex >= 0) {
          const clone = [...previous]
          clone[existingIndex] = normalized
          return clone
        }
        return [normalized, ...previous]
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to submit draft for review.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleWithdraw = async () => {
    if (!draft.id) return
    setError(null)
    try {
      setIsSaving(true)
      const response = await fetch(`/api/community/submissions/${draft.id}/withdraw`, {
        method: 'POST',
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to withdraw submission')
      }
      setStatusMap((previous) => ({ ...previous, [draft.id as string]: payload.submission.status }))
      setSubmissionList((previous) => {
        const normalized: SubmissionRecord = {
          ...(payload.submission as SubmissionRecord),
        }
        const clone = previous.map((entry) => (entry.id === normalized.id ? normalized : entry))
        return clone
      })
      setSuccess('Submission withdrawn. You can keep iterating before resubmitting.')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to withdraw submission.')
    } finally {
      setIsSaving(false)
    }
  }

  const currentStatus = selectedId === 'new' ? 'draft' : statusMap[selectedId] ?? 'draft'

  const statusStyle = statusStyles[currentStatus] ?? 'bg-[#E0E0E0] text-[#424242]'

  const revisionTimeline = useMemo(() => {
    if (selectedId === 'new') {
      return []
    }

    const submission = submissionList.find((entry) => entry.id === selectedId)
    if (!submission) return []

    const timeline: Array<{ label: string; value: string | null }> = [
      { label: 'Last updated', value: submission.updated_at },
      { label: 'Submitted', value: submission.submitted_at },
      { label: 'Feedback', value: submission.feedback },
    ]

    return timeline.filter((entry) => Boolean(entry.value))
  }, [selectedId, submissionList])

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      <aside className="flex flex-col gap-4 rounded-3xl border-4 border-[#121212] bg-white p-4 shadow-[6px_6px_0px_#121212]">
        <button
          type="button"
          onClick={() => setSelectedId('new')}
          className={cn(
            'rounded-2xl border-4 border-[#121212] px-4 py-3 text-left text-sm font-black uppercase tracking-wide shadow-[4px_4px_0px_#FFCF56] transition',
            selectedId === 'new' ? 'bg-[#121212] text-white' : 'bg-[#FFCF56] text-[#121212] hover:-translate-y-1',
          )}
        >
          + Start new draft
        </button>
        <div className="space-y-3">
          {submissionList.map((submission) => (
            <button
              key={submission.id}
              type="button"
              onClick={() => setSelectedId(submission.id)}
              className={cn(
                'w-full rounded-2xl border-4 border-[#121212] px-4 py-3 text-left text-sm font-semibold shadow-[4px_4px_0px_#121212] transition',
                selectedId === submission.id ? 'bg-[#6C63FF] text-white' : 'bg-white text-[#121212] hover:-translate-y-1',
              )}
            >
              <p className="font-black uppercase">{submission.title || 'Untitled draft'}</p>
              <p className="text-xs uppercase tracking-wide text-[#4B4B4B]">
                {statusMap[submission.id] ?? submission.status}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        <div className="rounded-3xl border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase text-[#121212]">Creator workspace</h2>
              <p className="text-sm font-semibold text-[#4B4B4B]">
                Draft in MDX, capture metadata, and partner with the Syntax &amp; Sips editorial crew.
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6C63FF]">
                {profile.displayName}
              </p>
            </div>
            <span className={cn('rounded-full px-4 py-2 text-xs font-black uppercase tracking-wide', statusStyle)}>
              {currentStatus.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="mt-4 text-xs font-semibold text-[#4B4B4B]">
            {lastSavedAt ? `Autosaved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Autosave pending...'}
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border-4 border-[#121212] bg-[#F7F4F0] p-6 shadow-[8px_8px_0px_#121212]">
          <label className="space-y-2">
            <span className="font-black uppercase text-[#121212]">Title</span>
            <input
              value={draft.title}
              onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
              className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
              placeholder="The experiment you want to ship"
            />
          </label>
          <label className="space-y-2">
            <span className="font-black uppercase text-[#121212]">Summary</span>
            <textarea
              value={draft.summary}
              onChange={(event) => setDraft((previous) => ({ ...previous, summary: event.target.value }))}
              className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FFCF56]"
              rows={3}
              placeholder="An espresso shot of what readers will learn."
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="font-black uppercase text-[#121212]">Slug (optional)</span>
              <input
                value={draft.slug ?? ''}
                onChange={(event) => setDraft((previous) => ({ ...previous, slug: event.target.value }))}
                className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
                placeholder="auto-generated if left blank"
              />
            </label>
            <label className="space-y-2">
              <span className="font-black uppercase text-[#121212]">Canonical URL</span>
              <input
                value={draft.metadata.canonicalUrl ?? ''}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    metadata: { ...previous.metadata, canonicalUrl: event.target.value || undefined },
                  }))
                }
                className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="font-black uppercase text-[#121212]">Series</span>
              <input
                value={draft.metadata.series ?? ''}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    metadata: { ...previous.metadata, series: event.target.value || undefined },
                  }))
                }
                className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              />
            </label>
            <label className="space-y-2">
              <span className="font-black uppercase text-[#121212]">Featured image URL</span>
              <input
                value={draft.metadata.featuredImageUrl ?? ''}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    metadata: { ...previous.metadata, featuredImageUrl: event.target.value || undefined },
                  }))
                }
                className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              />
            </label>
            <label className="space-y-2">
              <span className="font-black uppercase text-[#121212]">Tags (comma separated)</span>
              <input
                value={draft.tags.join(', ')}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    tags: event.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  }))
                }
                className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-lg font-semibold shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#FF8A65]"
              />
            </label>
          </div>

          <div className="space-y-3">
            <span className="font-black uppercase text-[#121212]">Categories</span>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const active = draft.categories.includes(category.name)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      setDraft((previous) => ({
                        ...previous,
                        categories: active
                          ? previous.categories.filter((entry) => entry !== category.name)
                          : [...previous.categories, category.name],
                      }))
                    }
                    className={cn(
                      'rounded-full border-4 px-4 py-2 text-sm font-black uppercase shadow-[3px_3px_0px_#121212] transition',
                      active
                        ? 'border-[#6C63FF] bg-[#6C63FF] text-white'
                        : 'border-[#121212] bg-white text-[#121212] hover:-translate-y-1',
                    )}
                  >
                    {category.name}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="space-y-2">
            <span className="font-black uppercase text-[#121212]">MDX draft</span>
            <textarea
              value={draft.content}
              onChange={(event) => setDraft((previous) => ({ ...previous, content: event.target.value }))}
              className="h-72 w-full rounded-2xl border-4 border-[#121212] bg-[#1F1F1F] px-4 py-3 text-sm font-mono text-[#F1F1F1] shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
              placeholder="## Headline\n\nCraft your story with MDX, embeds, and code blocks."
            />
          </label>

          <label className="space-y-2">
            <span className="font-black uppercase text-[#121212]">Notes to editors</span>
            <textarea
              value={draft.notesToEditors ?? ''}
              onChange={(event) => setDraft((previous) => ({ ...previous, notesToEditors: event.target.value }))}
              className="w-full rounded-2xl border-4 border-[#121212] bg-white px-4 py-3 text-sm font-semibold text-[#121212] shadow-[4px_4px_0px_#121212] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]"
              rows={3}
              placeholder="Context, blockers, or assets editors should review."
            />
          </label>
        </div>

        <div className="rounded-3xl border-4 border-[#121212] bg-white p-6 shadow-[8px_8px_0px_#121212]">
          <h3 className="text-xl font-black uppercase text-[#121212]">Editorial checklist</h3>
          <div className="mt-4 grid gap-3">
            {Object.entries(draft.checklist).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-3 rounded-2xl border-4 border-[#121212] bg-[#F7F4F0] px-4 py-3 text-sm font-semibold text-[#121212] shadow-[4px_4px_0px_#121212]"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      checklist: { ...previous.checklist, [key]: event.target.checked },
                    }))
                  }
                  className="h-5 w-5 accent-[#6C63FF]"
                />
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        </div>

        {feedback ? (
          <div className="rounded-3xl border-4 border-[#FF5252] bg-[#FFE6E0] p-6 shadow-[8px_8px_0px_#FF5252]">
            <h3 className="text-xl font-black uppercase text-[#B71C1C]">Editor feedback</h3>
            <p className="mt-2 text-sm font-semibold text-[#B71C1C]">{feedback}</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border-4 border-[#FF5252] bg-[#FFE6E0] p-4 text-sm font-semibold text-[#B71C1C]">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-3xl border-4 border-[#4CAF50] bg-[#E8F5E9] p-4 text-sm font-semibold text-[#1B5E20]">
            {success}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            className="rounded-2xl border-4 border-[#121212] bg-[#FFCF56] px-6 py-3 text-sm font-black uppercase tracking-wide text-[#121212] shadow-[5px_5px_0px_#121212] transition hover:-translate-y-1"
            disabled={isSaving}
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => void handleSubmitForReview()}
            className="rounded-2xl border-4 border-[#121212] bg-[#6C63FF] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[5px_5px_0px_#121212] transition hover:-translate-y-1"
            disabled={isSaving || !draft.id}
          >
            Submit for review
          </button>
          <button
            type="button"
            onClick={() => void handleWithdraw()}
            className="rounded-2xl border-4 border-[#121212] bg-white px-6 py-3 text-sm font-black uppercase tracking-wide text-[#121212] shadow-[5px_5px_0px_#121212] transition hover:-translate-y-1"
            disabled={isSaving || !draft.id}
          >
            Withdraw
          </button>
        </div>
      </div>

      <aside className="space-y-4 rounded-3xl border-4 border-[#121212] bg-white p-6 shadow-[6px_6px_0px_#121212]">
        <h3 className="text-lg font-black uppercase text-[#121212]">Revision history</h3>
        {revisionTimeline.length === 0 ? (
          <p className="text-sm font-semibold text-[#4B4B4B]">Autosaves and submissions will appear here.</p>
        ) : (
          <ul className="space-y-4">
            {revisionTimeline.map((entry) => (
              <li key={entry.label} className="rounded-2xl border-4 border-[#121212] bg-[#F7F4F0] px-4 py-3 text-xs font-semibold text-[#121212] shadow-[3px_3px_0px_#121212]">
                <p className="uppercase text-[#6C63FF]">{entry.label}</p>
                <p className="mt-1">{entry.value}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="rounded-2xl border-4 border-[#121212] bg-[#121212] px-4 py-3 text-xs font-semibold text-white shadow-[3px_3px_0px_#FFCF56]">
          <p>
            Need anything? Drop a note to editors above or email <a href="mailto:editors@syntaxandsips.com" className="underline">editors@syntaxandsips.com</a>.
          </p>
        </div>
      </aside>
    </div>
  )
}
