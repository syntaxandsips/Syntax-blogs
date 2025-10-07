"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { syncAuthState } from '@/lib/supabase/sync-auth-state';
import { useSupabaseAuthSync } from '@/hooks/useSupabaseAuthSync';
import '@/styles/neo-brutalism.css';

export const UserSignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect_to');

  const syncSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      await syncAuthState('SIGNED_IN', session);
    }
  }, [supabase]);

  useSupabaseAuthSync(supabase);

  useEffect(() => {
    const checkExistingSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        await syncAuthState('SIGNED_IN', session);
        router.replace(redirectTo ?? '/account');
      }
    };

    void checkExistingSession();
  }, [redirectTo, router, supabase]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setError('Unable to authenticate.');
      setIsLoading(false);
      return;
    }

    if (data.session) {
      await syncAuthState('SIGNED_IN', data.session);
    } else {
      await syncSession();
    }

    setInfo('Signed in successfully! Redirecting...');
    router.replace(redirectTo ?? '/account');
  };

  return (
    <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
      <div className="neo-container w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign in to Syntax &amp; Sips</h1>

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
              autoComplete="email"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button type="submit" disabled={isLoading} className="neo-button w-full py-2 px-4 text-center font-bold">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Need an account?{' '}
          <button
            type="button"
            className="text-purple-600 underline"
            onClick={() => router.push(`/signup${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`)}
          >
            Create one now
          </button>
          .
        </p>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Admins should continue using the dedicated admin sign-in page.</p>
        </div>
      </div>
    </div>
  );
};
