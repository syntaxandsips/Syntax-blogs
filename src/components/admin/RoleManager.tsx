'use client'

import { useMemo, useState } from 'react'
import { Search, Shield, Users } from 'lucide-react'
import type {
  AdminRole,
  AdminUserSummary,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/utils/types'
import { UserManagement } from './UserManagement'
import {
  compareRolePriority,
  getHighestRoleSlug,
  getRoleBadge,
  type CanonicalRoleSlug,
  sortRolesAscending,
} from '@/lib/rbac/permissions'

interface RoleManagerProps {
  users: AdminUserSummary[]
  roles: AdminRole[]
  isLoading: boolean
  isSaving: boolean
  currentProfileId: string
  onRefresh: () => Promise<void> | void
  onCreateUser: (payload: CreateAdminUserPayload) => Promise<boolean>
  onUpdateUser: (
    profileId: string,
    payload: UpdateAdminUserPayload,
  ) => Promise<boolean>
  onDeleteUser: (profileId: string) => Promise<boolean>
}

const badgeToneClass: Record<string, string> = {
  neutral:
    'border-brand-border-muted bg-brand-surface text-brand-ink/80 shadow-brand-sm',
  info: 'border-brand-border-info bg-brand-surface-info text-brand-ink shadow-brand-md',
  success:
    'border-brand-border-success bg-brand-surface-success text-brand-ink shadow-brand-md',
  warning:
    'border-brand-border-warning bg-brand-surface-warning text-brand-ink shadow-brand-lg',
  critical:
    'border-brand-border-critical bg-brand-surface-critical text-brand-ink shadow-brand-lg',
}

const buildRoleCounts = (
  users: AdminUserSummary[],
): Record<CanonicalRoleSlug, number> => {
  return users.reduce<Record<CanonicalRoleSlug, number>>((accumulator, user) => {
    const slug = getHighestRoleSlug(user.roles)
    accumulator[slug] = (accumulator[slug] ?? 0) + 1
    return accumulator
  }, {
    member: 0,
    contributor: 0,
    organizer: 0,
    moderator: 0,
    admin: 0,
  })
}

export const RoleManager = ({
  users,
  roles,
  isLoading,
  isSaving,
  currentProfileId,
  onRefresh,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
}: RoleManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    const matches = users.filter((user) => {
      if (!normalizedSearch) {
        return true
      }

      return (
        user.displayName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch)
      )
    })

    return matches.sort((left, right) => {
      const leftRole = getHighestRoleSlug(left.roles)
      const rightRole = getHighestRoleSlug(right.roles)

      if (leftRole !== rightRole) {
        return compareRolePriority(rightRole, leftRole)
      }

      return left.displayName.localeCompare(right.displayName)
    })
  }, [users, normalizedSearch])

  const roleCounts = useMemo(() => buildRoleCounts(users), [users])

  const summaryLabel = useMemo(() => {
    if (isLoading) {
      return 'Loading role assignments…'
    }

    return `${users.length} team member${users.length === 1 ? '' : 's'} with managed roles`
  }, [isLoading, users.length])

  const sortedRoles = useMemo(() => sortRolesAscending(roles), [roles])

  return (
    <section
      aria-labelledby="role-manager-heading"
      className="space-y-6 rounded-3xl border-4 border-brand-border bg-brand-panel p-6 shadow-[8px_8px_0px_rgba(34,34,34,0.2)]"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-ink/80">
            <Shield className="h-5 w-5" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
              Role governance
            </p>
          </div>
          <h2
            id="role-manager-heading"
            className="mt-1 text-2xl font-black text-brand-ink"
          >
            Platform role manager
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-ink/70">
            Assign canonical privileges, audit highest role badges, and maintain a
            clean roster for community moderation. Every change is audited and
            protected by the RBAC hardening feature flag.
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-brand-ink/60">
            {summaryLabel}
          </p>
        </div>
        <div className="flex w-full max-w-md items-center gap-2 rounded-full border-2 border-brand-border bg-white px-4 py-2 shadow-brand-sm focus-within:ring-4 focus-within:ring-brand-focus">
          <Search className="h-4 w-4 text-brand-ink/50" aria-hidden="true" />
          <label htmlFor="role-search" className="sr-only">
            Search by name or email
          </label>
          <input
            id="role-search"
            type="search"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 w-full border-none bg-transparent text-sm font-medium text-brand-ink placeholder:text-brand-ink/40 focus:outline-none"
          />
        </div>
      </div>

      <div
        className="grid gap-3 rounded-2xl border-2 border-dashed border-brand-border/60 bg-brand-surface px-4 py-3 text-sm text-brand-ink"
        role="region"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/60">
          <Users className="h-4 w-4" aria-hidden="true" /> Cohort by highest role
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.entries(roleCounts) as Array<[CanonicalRoleSlug, number]>).map(
            ([slug, total]) => {
              const badge = getRoleBadge(slug)
              return (
                <div
                  key={slug}
                  className={`flex flex-col rounded-xl border-2 px-4 py-3 transition hover:-translate-y-0.5 ${badgeToneClass[badge.tone]}`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink/60">
                    {badge.label}
                  </span>
                  <span className="text-2xl font-black text-brand-ink">{total}</span>
                  <span className="text-xs text-brand-ink/60">highest badge</span>
                </div>
              )
            },
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-brand-ink">Current roster</h3>
          <ul className="space-y-3" aria-label="Managed profiles">
            {filteredUsers.map((user) => {
              const badge = getRoleBadge(getHighestRoleSlug(user.roles))
              const badgeClass = badgeToneClass[badge.tone]
              const displayRoles = user.roles.length
                ? sortRolesAscending(user.roles).map((role) => role.name ?? role.slug)
                : ['Member']

              return (
                <li
                  key={user.profileId}
                  className="flex flex-col gap-2 rounded-xl border-2 border-brand-border bg-white px-4 py-3 shadow-brand-sm focus-within:outline focus-within:outline-4 focus-within:outline-brand-focus"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">{user.displayName}</p>
                      <p className="text-xs text-brand-ink/60">{user.email}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${badgeClass}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-brand-ink/60">
                    {displayRoles.map((roleLabel) => (
                      <span
                        key={`${user.profileId}-${roleLabel}`}
                        className="rounded-full border border-brand-border/40 bg-brand-surface px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em]"
                      >
                        {roleLabel}
                      </span>
                    ))}
                  </div>
                </li>
              )
            })}
            {filteredUsers.length === 0 && (
              <li className="rounded-xl border-2 border-dashed border-brand-border/60 bg-brand-surface px-4 py-6 text-center text-sm text-brand-ink/70">
                No users match that filter. Try a different name or email address.
              </li>
            )}
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-brand-border bg-white p-4 shadow-brand-lg">
          <UserManagement
            users={users}
            roles={sortedRoles}
            isLoading={isLoading}
            isSaving={isSaving}
            currentProfileId={currentProfileId}
            onRefresh={onRefresh}
            onCreateUser={onCreateUser}
            onUpdateUser={onUpdateUser}
            onDeleteUser={onDeleteUser}
          />
        </div>
      </div>
    </section>
  )
}
