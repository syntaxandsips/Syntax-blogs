'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ApplicationAction = 'approve' | 'decline' | 'needs_more_info'
type SubmissionAction = 'approve' | 'decline' | 'feedback'

export interface CommunityQueueApplication {
  id: string
  profile_id: string
  status: string
  submitted_at: string | null
  review_notes: string | null
  application_payload?: Record<string, unknown> | null
}

export interface CommunityQueueSubmission {
  id: string
  profile_id: string
  status: string
  title: string
  summary: string | null
  slug: string | null
  submitted_at: string | null
  feedback: string | null
}

interface CommunityReviewQueueProps {
  applications: CommunityQueueApplication[]
  submissions: CommunityQueueSubmission[]
  isLoading: boolean
  onRefresh: () => Promise<void>
  onApplicationAction: (id: string, action: ApplicationAction, notes?: string) => Promise<void>
  onSubmissionAction: (id: string, action: SubmissionAction, notes?: string) => Promise<void>
}

const statusBadgeClasses: Record<string, string> = {
  submitted: 'bg-[#C5CAE9] text-[#1A237E]',
  under_review: 'bg-[#FFF59D] text-[#F57F17]',
  needs_more_info: 'bg-[#FFE0B2] text-[#E65100]',
  accepted: 'bg-[#C8E6C9] text-[#1B5E20]',
  rejected: 'bg-[#FFCDD2] text-[#B71C1C]',
  approved: 'bg-[#C8E6C9] text-[#1B5E20]',
  in_review: 'bg-[#B2EBF2] text-[#004D40]',
  needs_revision: 'bg-[#FFCDD2] text-[#B71C1C]',
}

export const CommunityReviewQueue = ({
  applications,
  submissions,
  isLoading,
  onRefresh,
  onApplicationAction,
  onSubmissionAction,
}: CommunityReviewQueueProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [noteValue, setNoteValue] = useState('')
  const [noteComposer, setNoteComposer] = useState<
    | {
        context: 'application'
        id: string
        action: ApplicationAction
        title: string
        description: string
        placeholder: string
        successMessage: string
      }
    | {
        context: 'submission'
        id: string
        action: SubmissionAction
        title: string
        description: string
        placeholder: string
        successMessage: string
      }
    | null
  >(null)

  const runAction = async (fn: () => Promise<void>, message: string): Promise<boolean> => {
    setError(null)
    setSuccess(null)
    try {
      await fn()
      setSuccess(message)
      await onRefresh()
      return true
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to complete action.')
      return false
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    setSuccess(null)
    try {
      await onRefresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to refresh queue.')
    } finally {
      setIsRefreshing(false)
    }
  }

  const openNotesComposer = (
    config:
      | {
          context: 'application'
          id: string
          action: ApplicationAction
          title: string
          description: string
          placeholder: string
          successMessage: string
        }
      | {
          context: 'submission'
          id: string
          action: SubmissionAction
          title: string
          description: string
          placeholder: string
          successMessage: string
        },
  ) => {
    setNoteValue('')
    setNoteComposer(config)
  }

  const closeComposer = () => {
    setNoteValue('')
    setNoteComposer(null)
  }

  const submitComposerNotes = async () => {
    if (!noteComposer) return

    const note = noteValue.trim() === '' ? undefined : noteValue.trim()

    const succeeded = await runAction(() => {
      if (noteComposer.context === 'application') {
        return onApplicationAction(noteComposer.id, noteComposer.action, note)
      }

      return onSubmissionAction(noteComposer.id, noteComposer.action, note)
    }, noteComposer.successMessage)

    if (succeeded) {
      closeComposer()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase text-[#121212]">Community review queue</h2>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="rounded-2xl border-4 border-[#121212] bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-[#121212] shadow-[4px_4px_0px_#121212] transition hover:-translate-y-1"
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <p className="text-sm font-semibold text-[#4B4B4B]">
        Triage author applications and community submissions awaiting editorial decisions. Actions fire notifications, update
        Supabase, and log moderation events.
      </p>
      {error ? (
        <div className="rounded-3xl border-4 border-[#FF5252] bg-[#FFE6E0] px-4 py-3 text-sm font-semibold text-[#B71C1C]">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-3xl border-4 border-[#4CAF50] bg-[#E8F5E9] px-4 py-3 text-sm font-semibold text-[#1B5E20]">
          {success}
        </div>
      ) : null}

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase text-[#121212]">Author applications</h3>
          <span className="rounded-full border-2 border-[#121212] bg-white px-3 py-1 text-xs font-black uppercase text-[#121212]">
            {applications.length} in queue
          </span>
        </header>
        <div className="overflow-hidden rounded-3xl border-4 border-[#121212] bg-white shadow-[8px_8px_0px_#121212]">
          <table className="min-w-full divide-y-4 divide-[#121212]">
            <thead className="bg-[#121212] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Applicant</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Focus</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-[#121212]/30">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm font-semibold text-[#4B4B4B]">
                    {isLoading ? 'Loading applications…' : 'No applications awaiting review.'}
                  </td>
                </tr>
              ) : (
                applications.map((application) => {
                  const payload = application.application_payload ?? {}
                  const focusAreas = Array.isArray(payload?.focusAreas)
                    ? (payload?.focusAreas as string[])
                    : []
                  const applicantName = (payload?.fullName as string | undefined) ?? application.profile_id

                  return (
                    <tr key={application.id} className="bg-white">
                      <td className="px-4 py-4 align-top">
                        <p className="font-black text-[#121212]">{applicantName}</p>
                        <p className="text-xs font-semibold text-[#4B4B4B]">
                          Submitted {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-[#2A2A2A]">
                        {focusAreas.length > 0 ? focusAreas.join(', ') : '—'}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1 text-xs font-black uppercase',
                            statusBadgeClasses[application.status] ?? 'bg-[#E0E0E0] text-[#424242]',
                          )}
                        >
                          {application.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top text-right text-xs font-black uppercase text-[#121212]">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void runAction(
                                () => onApplicationAction(application.id, 'approve'),
                                'Application approved.',
                              )
                            }
                            className="rounded-xl border-3 border-[#121212] bg-[#C8E6C9] px-3 py-2 text-xs font-black text-[#1B5E20] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openNotesComposer({
                                context: 'application',
                                id: application.id,
                                action: 'needs_more_info',
                                title: 'Request additional information',
                                description:
                                  'Share context or clarifying questions for the applicant. This message is sent with the notification.',
                                placeholder: 'Let the applicant know what else would help you evaluate their submission…',
                                successMessage: 'Requested additional details.',
                              })
                            }
                            className="rounded-xl border-3 border-[#121212] bg-[#FFF59D] px-3 py-2 text-xs font-black text-[#F57F17] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                          >
                            Needs info
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              openNotesComposer({
                                context: 'application',
                                id: application.id,
                                action: 'decline',
                                title: 'Decline application',
                                description:
                                  'Optionally provide feedback so the applicant understands the decision and next steps.',
                                placeholder: 'Share constructive feedback or resources for the applicant…',
                                successMessage: 'Application declined.',
                              })
                            }
                            className="rounded-xl border-3 border-[#121212] bg-[#FFCDD2] px-3 py-2 text-xs font-black text-[#B71C1C] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                          >
                            Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h3 className="text-lg font-black uppercase text-[#121212]">Community submissions</h3>
          <span className="rounded-full border-2 border-[#121212] bg-white px-3 py-1 text-xs font-black uppercase text-[#121212]">
            {submissions.length} in queue
          </span>
        </header>
        <div className="overflow-hidden rounded-3xl border-4 border-[#121212] bg-white shadow-[8px_8px_0px_#121212]">
          <table className="min-w-full divide-y-4 divide-[#121212]">
            <thead className="bg-[#121212] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wide">Submitted</th>
                <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-[#121212]/30">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm font-semibold text-[#4B4B4B]">
                    {isLoading ? 'Loading submissions…' : 'No submissions awaiting review.'}
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="bg-white">
                    <td className="px-4 py-4 align-top">
                      <p className="font-black text-[#121212]">{submission.title || 'Untitled draft'}</p>
                      <p className="mt-1 text-xs font-semibold text-[#4B4B4B]">{submission.summary}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-black uppercase',
                          statusBadgeClasses[submission.status] ?? 'bg-[#E0E0E0] text-[#424242]',
                        )}
                      >
                        {submission.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm font-semibold text-[#2A2A2A]">
                      {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-4 align-top text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2 text-xs font-black uppercase text-[#121212]">
                        <button
                          type="button"
                          onClick={() =>
                            void runAction(
                              () => onSubmissionAction(submission.id, 'approve'),
                              'Submission approved and synced.',
                            )
                          }
                          className="rounded-xl border-3 border-[#121212] bg-[#C8E6C9] px-3 py-2 text-xs font-black text-[#1B5E20] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openNotesComposer({
                              context: 'submission',
                              id: submission.id,
                              action: 'feedback',
                              title: 'Request revisions',
                              description:
                                'Outline specific edits or additions the contributor should make before re-submitting.',
                              placeholder: 'Detail revision requests, references, or editorial suggestions…',
                              successMessage: 'Feedback shared with contributor.',
                            })
                          }
                          className="rounded-xl border-3 border-[#121212] bg-[#FFF59D] px-3 py-2 text-xs font-black text-[#F57F17] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                        >
                          Request changes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openNotesComposer({
                              context: 'submission',
                              id: submission.id,
                              action: 'decline',
                              title: 'Decline submission',
                              description:
                                'Let the contributor know why their draft isn’t moving forward and how they can improve next time.',
                              placeholder: 'Offer constructive feedback, themes to explore, or community resources…',
                              successMessage: 'Submission declined.',
                            })
                          }
                          className="rounded-xl border-3 border-[#121212] bg-[#FFCDD2] px-3 py-2 text-xs font-black text-[#B71C1C] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {noteComposer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div
            className="w-full max-w-xl rounded-3xl border-4 border-[#121212] bg-[#FDF7ED] p-6 shadow-[12px_12px_0px_#121212]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-composer-title"
            aria-describedby="note-composer-description"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#FF6F3C]">Moderation note</p>
                <h4 id="note-composer-title" className="mt-2 text-2xl font-black uppercase text-[#121212]">
                  {noteComposer.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={closeComposer}
                className="rounded-xl border-3 border-[#121212] bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-[#121212] shadow-[3px_3px_0px_#121212] hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
            <p id="note-composer-description" className="mt-4 text-sm font-semibold text-[#424242]">
              {noteComposer.description}
            </p>
            <label className="mt-5 block text-xs font-black uppercase tracking-wide text-[#121212]" htmlFor="moderation-notes">
              Notes (optional)
            </label>
            <textarea
              id="moderation-notes"
              value={noteValue}
              onChange={(event) => setNoteValue(event.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border-4 border-[#121212] bg-white p-3 text-sm font-semibold text-[#121212] shadow-[6px_6px_0px_#121212] focus:outline-none"
              placeholder={noteComposer.placeholder}
            />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => void submitComposerNotes()}
                className="inline-flex items-center justify-center rounded-2xl border-4 border-[#121212] bg-[#121212] px-5 py-2 text-sm font-black uppercase tracking-wide text-white shadow-[6px_6px_0px_#FFCF56] transition hover:-translate-y-0.5"
              >
                Send update
              </button>
              <button
                type="button"
                onClick={closeComposer}
                className="inline-flex items-center justify-center rounded-2xl border-4 border-[#121212] bg-white px-5 py-2 text-sm font-black uppercase tracking-wide text-[#121212] shadow-[6px_6px_0px_#6C63FF] transition hover:-translate-y-0.5"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
