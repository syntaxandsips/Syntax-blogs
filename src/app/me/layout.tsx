import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server-client'
import type { Database } from '@/lib/supabase/types'
import { LibraryNav } from '@/components/library/LibraryNav'

export const dynamic = 'force-dynamic'

interface MeLayoutProps {
  children: ReactNode
}

export default async function MeLayout({ children }: MeLayoutProps) {
  const supabase = createServerComponentClient<Database>()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/me')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(`Unable to load profile: ${error.message}`)
  }

  if (!profile) {
    redirect('/signup')
  }

  return (
    <div className="min-h-screen bg-[#FDF7FF] py-10">
      <div className="container mx-auto flex flex-col gap-10 px-4 lg:flex-row">
        <LibraryNav profileName={profile.display_name ?? 'Reader'} />
        <div className="flex-1">
          <div className="rounded-[32px] border-4 border-black bg-white p-6 shadow-[16px_16px_0px_0px_rgba(0,0,0,0.2)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
