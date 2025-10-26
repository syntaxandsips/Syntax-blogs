'use client'

interface MembershipRow {
  profileId: string
  displayName: string
  status: 'pending' | 'active' | 'banned'
  role: string | null
  requestedAt?: string | null
}

interface MembershipPanelProps {
  members: MembershipRow[]
  pending: MembershipRow[]
  canModerate: boolean
  onApprove?: (profileId: string) => Promise<void>
  onBan?: (profileId: string) => Promise<void>
}

export const MembershipPanel = ({
  members,
  pending,
  canModerate,
  onApprove,
  onBan,
}: MembershipPanelProps) => {
  return (
    <div className="rounded-3xl border-4 border-black bg-[#F6F6F6] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
      <h2 className="text-2xl font-black uppercase text-black">Members</h2>
      <p className="mt-1 text-sm text-black/70">
        Track membership status and approve new collaborators. Pending requests are limited to 72 hours to
        keep momentum high.
      </p>

      <div className="mt-6 space-y-4">
        {pending.length > 0 ? (
          <section>
            <h3 className="text-lg font-bold uppercase text-black">Pending requests</h3>
            <ul className="mt-3 space-y-2">
              {pending.map((request) => (
                <li
                  key={request.profileId}
                  className="flex flex-col gap-2 rounded-xl border-2 border-black bg-white p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-black">{request.displayName}</p>
                    <p className="text-xs uppercase tracking-wide text-black/60">
                      Requested {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'just now'}
                    </p>
                  </div>
                  {canModerate ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border-2 border-black bg-[#06D6A0] px-3 py-1 text-xs font-extrabold uppercase text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                        onClick={() => onApprove?.(request.profileId)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-md border-2 border-black bg-[#EF476F] px-3 py-1 text-xs font-extrabold uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                        onClick={() => onBan?.(request.profileId)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <p className="rounded-xl border-2 border-dashed border-black px-4 py-3 text-sm text-black/60">
            No pending membership requests.
          </p>
        )}
      </div>

      <section className="mt-6">
        <h3 className="text-lg font-bold uppercase text-black">Active members</h3>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {members.length === 0 ? (
            <p className="rounded-xl border-2 border-dashed border-black px-4 py-3 text-sm text-black/60">
              No active members yet.
            </p>
          ) : (
            members.map((member) => (
              <li key={member.profileId} className="rounded-xl border-2 border-black bg-white p-3">
                <p className="text-sm font-semibold text-black">{member.displayName}</p>
                <p className="text-xs uppercase tracking-wide text-black/50">{member.role ?? 'member'}</p>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  )
}
