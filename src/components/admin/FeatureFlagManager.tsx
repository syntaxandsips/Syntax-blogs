'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  Flag,
  History,
  Loader2,
  RefreshCcw,
  Save,
} from 'lucide-react'
import { FEATURE_FLAG_KEYS, type FeatureFlagKey } from '@/lib/feature-flags/registry'
import type {
  AdminFeatureFlagAuditEntry,
  AdminFeatureFlagRecord,
} from '@/utils/types'
import { useToast } from './ToastProvider'

interface FlagDraft {
  record: AdminFeatureFlagRecord
  draft: {
    description: string
    owner: string
    enabled: boolean
    reason: string
  }
  isSaving: boolean
}

interface FeatureFlagResponse {
  flags: AdminFeatureFlagRecord[]
  audit: AdminFeatureFlagAuditEntry[]
}

const createFlagDraft = (record: AdminFeatureFlagRecord): FlagDraft => ({
  record,
  draft: {
    description: record.description,
    owner: record.owner,
    enabled: record.enabled,
    reason: '',
  },
  isSaving: false,
})

const hasChanges = (draft: FlagDraft) =>
  draft.draft.description.trim() !== draft.record.description.trim() ||
  draft.draft.owner.trim() !== draft.record.owner.trim() ||
  draft.draft.enabled !== draft.record.enabled ||
  draft.draft.reason.trim().length > 0

export const FeatureFlagManager = () => {
  const { showToast } = useToast()
  const [flags, setFlags] = useState<FlagDraft[]>([])
  const [auditLog, setAuditLog] = useState<AdminFeatureFlagAuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchFlags = useCallback(async () => {
    setIsRefreshing(true)

    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'GET',
        cache: 'no-store',
      })

      const payload = (await response.json()) as FeatureFlagResponse & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load feature flags.')
      }

      const ordered = FEATURE_FLAG_KEYS.map((flagKey) =>
        payload.flags.find((flag) => flag.flagKey === flagKey) ?? {
          id: null,
          flagKey,
          description: 'Flag not yet initialized. Save changes to persist governance metadata.',
          owner: 'Unassigned',
          enabled: false,
          metadata: {},
          createdAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
          createdBy: null,
          updatedBy: null,
          persisted: false,
        },
      )

      setFlags(ordered.map(createFlagDraft))
      setAuditLog(payload.audit ?? [])
    } catch (error) {
      showToast({
        variant: 'error',
        title: 'Unable to load feature flags',
        description: error instanceof Error ? error.message : 'Unable to load feature flags.',
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchFlags()
  }, [fetchFlags])

  const updateFlagDraft = useCallback((flagKey: FeatureFlagKey, updater: (draft: FlagDraft) => FlagDraft) => {
    setFlags((previous) =>
      previous.map((flag) => (flag.record.flagKey === flagKey ? updater(flag) : flag)),
    )
  }, [])

  const handleReset = useCallback(
    (flagKey: FeatureFlagKey) => {
      updateFlagDraft(flagKey, (flag) =>
        createFlagDraft(flag.record),
      )
    },
    [updateFlagDraft],
  )

  const handleSave = useCallback(
    async (flag: FlagDraft) => {
      updateFlagDraft(flag.record.flagKey, (draft) => ({ ...draft, isSaving: true }))

      try {
        const method = flag.record.persisted ? 'PATCH' : 'POST'
        const response = await fetch('/api/admin/feature-flags', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flagKey: flag.record.flagKey,
            description: flag.draft.description.trim(),
            owner: flag.draft.owner.trim(),
            enabled: flag.draft.enabled,
            reason: flag.draft.reason.trim() || undefined,
          }),
        })

        const payload = (await response.json()) as {
          flag?: AdminFeatureFlagRecord
          error?: string
          message?: string
        }

        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to save feature flag.')
        }

        if (payload.flag) {
          setFlags((previous) =>
            previous.map((entry) =>
              entry.record.flagKey === payload.flag!.flagKey
                ? createFlagDraft(payload.flag!)
                : entry,
            ),
          )
        }

        showToast({
          variant: 'success',
          title: 'Feature flag saved',
          description: payload.message ?? 'Flag configuration updated successfully.',
        })

        void fetchFlags()
      } catch (error) {
        showToast({
          variant: 'error',
          title: 'Unable to save feature flag',
          description: error instanceof Error ? error.message : 'Unable to save feature flag.',
        })
      } finally {
        updateFlagDraft(flag.record.flagKey, (draft) => ({ ...draft, isSaving: false }))
      }
    },
    [fetchFlags, showToast, updateFlagDraft],
  )

  const dirtyFlags = useMemo(() => flags.filter((flag) => hasChanges(flag)), [flags])

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <Flag className="h-8 w-8 text-[#FF5252]" aria-hidden="true" />
          <div>
            <h1 className="text-3xl font-black text-[#2A2A2A]">Feature Flags</h1>
            <p className="text-sm text-[#2A2A2A]/70">
              Govern platform capabilities and rollout states. All changes are audited and reversible.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#2A2A2A]/70">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
          <span>{dirtyFlags.length} draft change{dirtyFlags.length === 1 ? '' : 's'} pending save</span>
        </div>
        <button
          type="button"
          onClick={() => fetchFlags()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold text-[#2A2A2A] shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCcw className="h-4 w-4" aria-hidden="true" />}
          Refresh
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border-4 border-dashed border-black/40 bg-white p-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#6C63FF]" aria-hidden="true" />
          <span className="ml-3 text-sm font-semibold text-[#2A2A2A]">Loading feature flags…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {flags.map((flag) => {
            const lastUpdatedLabel = formatDistanceToNow(new Date(flag.record.updatedAt || flag.record.createdAt), {
              addSuffix: true,
            })
            const flagId = `flag-${flag.record.flagKey}`
            const hasPendingChanges = hasChanges(flag)

            return (
              <section
                key={flag.record.flagKey}
                className="space-y-6 rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]"
                aria-labelledby={`${flagId}-label`}
              >
                <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        id={`${flagId}-label`}
                        className="text-xl font-black text-[#2A2A2A]"
                      >
                        {flag.record.flagKey}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${flag.record.persisted ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {flag.record.persisted ? 'Active' : 'Needs setup'}
                      </span>
                    </div>
                    <p className="text-sm text-[#2A2A2A]/70">
                      {flag.draft.description || 'Provide a short description to document rollout scope.'}
                    </p>
                    <p className="text-xs text-[#2A2A2A]/60">Last updated {lastUpdatedLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${flag.draft.enabled ? 'bg-[#6C63FF] text-white' : 'bg-gray-200 text-[#2A2A2A]'}`}
                    >
                      {flag.draft.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/80">
                      Owner
                    </span>
                    <input
                      type="text"
                      value={flag.draft.owner}
                      onChange={(event) =>
                        updateFlagDraft(flag.record.flagKey, (current) => ({
                          ...current,
                          draft: { ...current.draft, owner: event.target.value },
                        }))
                      }
                      className="w-full rounded-md border-2 border-black/10 bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.08)] focus:border-[#6C63FF] focus:outline-none"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/80">
                      Description
                    </span>
                    <textarea
                      value={flag.draft.description}
                      onChange={(event) =>
                        updateFlagDraft(flag.record.flagKey, (current) => ({
                          ...current,
                          draft: { ...current.draft, description: event.target.value },
                        }))
                      }
                      rows={3}
                      className="w-full rounded-md border-2 border-black/10 bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.08)] focus:border-[#6C63FF] focus:outline-none"
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
                    <input
                      id={`${flagId}-toggle`}
                      type="checkbox"
                      checked={flag.draft.enabled}
                      onChange={(event) =>
                        updateFlagDraft(flag.record.flagKey, (current) => ({
                          ...current,
                          draft: { ...current.draft, enabled: event.target.checked },
                        }))
                      }
                      className="h-4 w-4"
                      aria-describedby={`${flagId}-status-hint`}
                    />
                    <div>
                      <span className="block text-sm font-semibold text-[#2A2A2A]">Enable for rollout</span>
                      <span id={`${flagId}-status-hint`} className="text-xs text-[#2A2A2A]/70">
                        Toggle feature availability globally. Downstream modules must still honour per-space gates.
                      </span>
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/80">
                      Change reason (optional)
                    </span>
                    <input
                      type="text"
                      value={flag.draft.reason}
                      onChange={(event) =>
                        updateFlagDraft(flag.record.flagKey, (current) => ({
                          ...current,
                          draft: { ...current.draft, reason: event.target.value },
                        }))
                      }
                      placeholder="Document rollout decision"
                      className="w-full rounded-md border-2 border-black/10 bg-white px-3 py-2 text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.08)] focus:border-[#6C63FF] focus:outline-none"
                    />
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#2A2A2A]/70">
                    <History className="h-4 w-4" aria-hidden="true" />
                    <span>Changes automatically appear in the immutable audit log.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleReset(flag.record.flagKey)}
                      disabled={!hasPendingChanges || flag.isSaving}
                      className="inline-flex items-center gap-2 rounded-md border-2 border-black/20 bg-white px-3 py-2 text-sm font-semibold text-[#2A2A2A] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSave(flag)}
                      disabled={!hasPendingChanges || flag.isSaving}
                      className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {flag.isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                      Save changes
                    </button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      <section className="space-y-4">
        <header className="flex items-center gap-3">
          <History className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-bold text-[#2A2A2A]">Audit trail</h2>
            <p className="text-xs text-[#2A2A2A]/70">Last 50 flag changes with actor attribution.</p>
          </div>
        </header>
        {auditLog.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-black/20 bg-white p-6 text-sm text-[#2A2A2A]/70">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <span>No feature flag changes recorded yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-black/5 rounded-xl border-2 border-black/10 bg-white text-sm">
              <thead className="bg-[#f8f9ff] text-left text-xs uppercase tracking-wide text-[#2A2A2A]/70">
                <tr>
                  <th scope="col" className="px-4 py-3">Flag</th>
                  <th scope="col" className="px-4 py-3">Change</th>
                  <th scope="col" className="px-4 py-3">Actor</th>
                  <th scope="col" className="px-4 py-3">Reason</th>
                  <th scope="col" className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.map((entry) => {
                  const timestamp = formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                  })

                  return (
                    <tr key={entry.id} className="odd:bg-white even:bg-[#fdf1f0]">
                      <td className="px-4 py-3 font-semibold text-[#2A2A2A]">{entry.flagKey}</td>
                      <td className="px-4 py-3 text-[#2A2A2A]/80">
                        {entry.previousEnabled === entry.newEnabled
                          ? 'Metadata updated'
                          : `${entry.previousEnabled ? 'Enabled' : 'Disabled'} → ${entry.newEnabled ? 'Enabled' : 'Disabled'}`}
                      </td>
                      <td className="px-4 py-3 text-[#2A2A2A]/80">
                        {entry.changedBy ?? 'service_role'} ({entry.changedByRole})
                      </td>
                      <td className="px-4 py-3 text-[#2A2A2A]/80">
                        {entry.reason ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[#2A2A2A]/70">{timestamp}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
