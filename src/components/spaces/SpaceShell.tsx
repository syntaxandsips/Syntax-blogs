'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { SpaceHeader } from '@/components/spaces/SpaceHeader'
import { MembershipPanel } from '@/components/spaces/MembershipPanel'
import { RulesEditor } from '@/components/spaces/RulesEditor'

interface SpaceMemberSummary {
  profileId: string
  displayName: string
  status: 'pending' | 'active' | 'banned'
  role: string | null
  requestedAt?: string | null
}

interface SpaceRuleSummary {
  id: string
  title: string
  body: string
  kind: string
  position: number
}

interface SpaceShellProps {
  spaceId: string
  slug: string
  name: string
  description?: string | null
  visibility: 'public' | 'private' | 'unlisted'
  membershipStatus: 'pending' | 'active' | 'banned' | null
  membershipRole: string | null
  rules: SpaceRuleSummary[]
  members: SpaceMemberSummary[]
  canModerate: boolean
}

const fetchJson = async (input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw new Error(payload.error ?? 'Request failed')
  }
}

export const SpaceShell = ({
  spaceId,
  slug,
  name,
  description,
  visibility,
  membershipStatus,
  membershipRole,
  rules,
  members,
  canModerate,
}: SpaceShellProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleJoin = async () => {
    await fetchJson(`/api/spaces/${spaceId}/members`, { method: 'POST', body: JSON.stringify({}) })
    startTransition(() => router.refresh())
  }

  const handleApprove = async (profileId: string) => {
    await fetchJson(`/api/spaces/${spaceId}/members/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'approve' }),
    })
    startTransition(() => router.refresh())
  }

  const handleBan = async (profileId: string) => {
    await fetchJson(`/api/spaces/${spaceId}/members/${profileId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'ban' }),
    })
    startTransition(() => router.refresh())
  }

  const pendingMembers = members.filter((member) => member.status === 'pending')
  const activeMembers = members.filter((member) => member.status === 'active')

  return (
    <div className="space-y-6">
      <SpaceHeader
        name={name}
        slug={slug}
        description={description}
        visibility={visibility}
        membershipStatus={membershipStatus}
        membershipRole={membershipRole}
        canModerate={canModerate}
        onJoinRequest={membershipStatus === 'banned' ? undefined : handleJoin}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <RulesEditor rules={rules} canEdit={canModerate} />
        <MembershipPanel
          members={activeMembers}
          pending={pendingMembers}
          canModerate={canModerate && !isPending}
          onApprove={canModerate ? handleApprove : undefined}
          onBan={canModerate ? handleBan : undefined}
        />
      </div>
    </div>
  )
}
