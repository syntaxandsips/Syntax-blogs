"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  AdminRole,
  AdminUserSummary,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from '@/utils/types'

interface UserManagementProps {
  users: AdminUserSummary[]
  roles: AdminRole[]
  isLoading: boolean
  isSaving: boolean
  onRefresh: () => Promise<void> | void
  onCreateUser: (payload: CreateAdminUserPayload) => Promise<boolean>
  onUpdateUser: (profileId: string, payload: UpdateAdminUserPayload) => Promise<boolean>
}

type FormMode = 'create' | 'edit'

const DEFAULT_CREATE_ROLE = 'member'

export const UserManagement = ({
  users,
  roles,
  isLoading,
  isSaving,
  onRefresh,
  onCreateUser,
  onUpdateUser,
}: UserManagementProps) => {
  const [mode, setMode] = useState<FormMode>('create')
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [roleSlugs, setRoleSlugs] = useState<Set<string>>(new Set([DEFAULT_CREATE_ROLE]))

  const sortedRoles = useMemo(
    () => [...roles].sort((a, b) => a.priority - b.priority),
    [roles],
  )

  useEffect(() => {
    if (mode === 'create') {
      setEmail('')
      setPassword('')
      setNewPassword('')
      setDisplayName('')
      setIsAdmin(false)
      setRoleSlugs(new Set([DEFAULT_CREATE_ROLE]))
      setSelectedUser(null)
    }
  }, [mode])

  useEffect(() => {
    if (mode === 'edit' && selectedUser) {
      setEmail(selectedUser.email)
      setDisplayName(selectedUser.displayName)
      setIsAdmin(selectedUser.isAdmin)
      setNewPassword('')
      setPassword('')
      setRoleSlugs(
        new Set(
          selectedUser.roles.length > 0
            ? selectedUser.roles.map((role) => role.slug)
            : [DEFAULT_CREATE_ROLE],
        ),
      )
    }
  }, [mode, selectedUser])

  const resetToCreateMode = () => {
    setMode('create')
  }

  const ensureRoleSelection = (nextRoles: Set<string>, includeAdmin: boolean) => {
    const updated = new Set(nextRoles)
    updated.add(DEFAULT_CREATE_ROLE)
    if (includeAdmin) {
      updated.add('admin')
    } else {
      updated.delete('admin')
    }
    return updated
  }

  const handleToggleRole = (slug: string) => {
    if (slug === DEFAULT_CREATE_ROLE) {
      return
    }

    setRoleSlugs((current) => {
      const next = new Set(current)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return ensureRoleSelection(next, isAdmin)
    })
  }

  const handleAdminToggle = (value: boolean) => {
    setIsAdmin(value)
    setRoleSlugs((current) => ensureRoleSelection(current, value))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const baseRoles = ensureRoleSelection(roleSlugs, isAdmin)
    const payloadRoles = Array.from(baseRoles)

    if (mode === 'create') {
      const success = await onCreateUser({
        email: email.trim(),
        password: password.trim(),
        displayName: displayName.trim(),
        isAdmin,
        roleSlugs: payloadRoles,
      })

      if (success) {
        resetToCreateMode()
      }
      return
    }

    if (!selectedUser) {
      return
    }

    const success = await onUpdateUser(selectedUser.profileId, {
      displayName: displayName.trim(),
      isAdmin,
      roleSlugs: payloadRoles,
      newPassword: newPassword.trim() ? newPassword.trim() : undefined,
    })

    if (success) {
      setNewPassword('')
    }
  }

  const handleEditClick = (user: AdminUserSummary) => {
    setSelectedUser(user)
    setMode('edit')
  }

  const renderRoleSelector = () => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700">Roles</p>
      {sortedRoles.length === 0 ? (
        <p className="text-xs text-gray-500">
          No roles are configured yet. Add roles in the database to control access levels.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sortedRoles.map((role) => {
            const isChecked = roleSlugs.has(role.slug)
            const isDisabled = role.slug === DEFAULT_CREATE_ROLE
            return (
              <label
                key={role.id}
                className={`flex items-start gap-2 rounded-md border-2 p-3 transition-colors ${
                  isChecked
                    ? 'border-[#6C63FF] bg-[#6C63FF]/5'
                    : 'border-gray-200 hover:border-[#6C63FF]/40'
                } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => handleToggleRole(role.slug)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-sm text-gray-900">
                    {role.name}
                  </span>
                  {role.description && (
                    <span className="block text-xs text-gray-500">{role.description}</span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2A2A2A]">User Management</h1>
          <p className="text-gray-600">
            Create new accounts, manage roles, and control access to the dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetToCreateMode}
            className={`neo-button px-4 py-2 font-bold ${
              mode === 'create' ? 'bg-[#6C63FF] text-white' : 'bg-white text-[#2A2A2A]'
            }`}
          >
            + New User
          </button>
          <button
            type="button"
            onClick={() => {
              void onRefresh()
            }}
            className="neo-button px-4 py-2 font-bold bg-white text-[#2A2A2A]"
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#2A2A2A]">Team Members</h2>
            <span className="text-sm text-gray-500">{users.length} total</span>
          </div>

          {isLoading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found. Create the first account above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Roles</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.profileId} className="text-sm">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {user.displayName}
                        {user.isAdmin && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-[#6C63FF]/10 px-2 py-0.5 text-xs font-bold text-[#6C63FF]">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.roles.length === 0 ? (
                          <span className="italic text-gray-400">No roles</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map((role) => (
                              <span
                                key={`${user.profileId}-${role.id}`}
                                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700"
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleEditClick(user)}
                          className="neo-button px-3 py-1 text-xs font-bold bg-white text-[#2A2A2A]"
                          disabled={isSaving && selectedUser?.profileId === user.profileId}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white border-3 border-[#2A2A2A]/20 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4">
            {mode === 'create' ? 'Create New User' : 'Update User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'create' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-md border-2 border-gray-300 px-3 py-2 focus:border-[#6C63FF] focus:outline-none"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="w-full rounded-md border-2 border-gray-300 px-3 py-2 focus:border-[#6C63FF] focus:outline-none"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Share this password with the new admin. They can update it after signing in.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-md border-2 border-gray-200 bg-gray-100 px-3 py-2 text-gray-600"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                className="w-full rounded-md border-2 border-gray-300 px-3 py-2 focus:border-[#6C63FF] focus:outline-none"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="user-management-is-admin"
                type="checkbox"
                checked={isAdmin}
                onChange={(event) => handleAdminToggle(event.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="user-management-is-admin" className="text-sm font-semibold text-gray-700">
                Grant administrator access
              </label>
            </div>

            {renderRoleSelector()}

            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reset Password (optional)
                </label>
                <input
                  type="password"
                  minLength={8}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-md border-2 border-gray-300 px-3 py-2 focus:border-[#6C63FF] focus:outline-none"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="neo-button px-4 py-2 font-bold bg-[#FF5252] text-white"
                disabled={isSaving}
              >
                {isSaving
                  ? mode === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : mode === 'create'
                  ? 'Create User'
                  : 'Save Changes'}
              </button>
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={resetToCreateMode}
                  className="neo-button px-4 py-2 font-bold bg-white text-[#2A2A2A]"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
