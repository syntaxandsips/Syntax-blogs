"use client";

import { useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { syncAuthState } from '@/lib/supabase/sync-auth-state';

export const useSupabaseAuthSync = (supabase: SupabaseClient) => {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void syncAuthState(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
};
