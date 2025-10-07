import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Syncs the Supabase auth state with the Next.js server-side session so that
 * server components can access the latest authentication context.
 */
export const syncAuthState = async (event: AuthChangeEvent, session: Session | null) => {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, session }),
    });
  } catch (error) {
    console.error('Failed to sync auth session', error);
  }
};
