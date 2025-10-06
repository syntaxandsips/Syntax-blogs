"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/styles/neo-brutalism.css';
import { createBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const syncAuthState = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ event, session }),
        });
      } catch (syncError) {
        console.error('Failed to sync auth session', syncError);
      }
    },
    [],
  );

  useEffect(() => {
    const unauthorized = searchParams.get('error');
    if (unauthorized === 'not_authorized') {
      setError('You do not have permission to access the admin dashboard.');
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return;
      }

      await syncAuthState('SIGNED_IN', session);

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profile?.is_admin) {
        router.replace('/admin');
      } else {
        setError('Your account is not authorized for admin access.');
        await supabase.auth.signOut();
      }
    };

    void checkSession();
  }, [router, supabase, syncAuthState]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void syncAuthState(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncAuthState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const normalizedMessage = signInError.message.toLowerCase();
      const friendlyMessage = normalizedMessage.includes('invalid login')
        ? 'Invalid login credentials. If you are using the bundled admin account, run `npm run seed:test-user` to (re)create it and confirm the profile is flagged as admin in Supabase.'
        : signInError.message;
      setError(friendlyMessage);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError('Unable to authenticate.');
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, is_admin')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (profileError) {
      setError('Unable to load your profile. Please try again.');
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    if (!profile?.is_admin) {
      setError('This account is not authorized for admin access.');
      await supabase.auth.signOut();
      setIsLoading(false);
      return;
    }

    if (data.session) {
      await syncAuthState('SIGNED_IN', data.session);
    }

    setInfo('Login successful! Redirecting to the dashboard...');
    router.replace('/admin');
  };

  return (
    <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
      <div className="neo-container w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Login</h1>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}

        {info && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="status">
            <p>{info}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="neo-button w-full py-2 px-4 text-center font-bold"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Use your Supabase email and password. Only accounts marked as admin in
            the <code>profiles</code> table can access this dashboard.
          </p>
          <p className="mt-2">
            Need a test account? Run <code>npm run seed:test-user</code> after applying
            the migrations to generate <code>test.admin@syntaxblogs.dev</code> with the
            default password.
          </p>
        </div>
      </div>
    </div>
  );
}
