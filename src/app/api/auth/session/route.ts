import { NextResponse } from 'next/server';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server-client';

interface SyncAuthPayload {
  event?: AuthChangeEvent;
  session?: Session | null;
}

export async function POST(request: Request) {
  const supabase = createServerClient();

  try {
    const { event, session }: SyncAuthPayload = await request.json();

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Missing auth change event.' },
        { status: 400 },
      );
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Missing session for auth event.' },
          { status: 400 },
        );
      }

      const { error } = await supabase.auth.setSession(session);

      if (error) {
        console.error('Failed to persist Supabase session', error);
        return NextResponse.json(
          { success: false, error: 'Unable to persist session.' },
          { status: 500 },
        );
      }
    }

    if (event === 'SIGNED_OUT') {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Failed to clear Supabase session', error);
        return NextResponse.json(
          { success: false, error: 'Unable to clear session.' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to sync auth session', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync auth session.' },
      { status: 500 },
    );
  }
}
