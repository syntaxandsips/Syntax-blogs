"use client";

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { syncAuthState } from '@/lib/supabase/sync-auth-state';
import { useSupabaseAuthSync } from '@/hooks/useSupabaseAuthSync';
import '@/styles/neo-brutalism.css';

export const UserSignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect_to');

  useSupabaseAuthSync(supabase);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim() || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    if (data.session) {
      await syncAuthState('SIGNED_IN', data.session);
      setInfo('Account created! Redirecting to your account...');
      router.replace(redirectTo ?? '/account');
      return;
    }

    setInfo('Check your inbox to confirm your email address before signing in.');
    setIsLoading(false);
  };

  return (
    <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
      <div className="neo-container w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Create your Syntax &amp; Sips account</h1>

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
            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-1">
              Display name
            </label>
            <input
              id="display-name"
              name="displayName"
              type="text"
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-3 py-2 border border-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <button type="submit" disabled={isLoading} className="neo-button w-full py-2 px-4 text-center font-bold">
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button
            type="button"
            className="text-purple-600 underline"
            onClick={() => router.push(`/login${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`)}
          >
            Sign in
          </button>
          .
        </p>

        <div className="mt-4 text-center text-xs text-gray-400">
          <p>Admin accounts must use the dedicated admin sign-in page to reach the dashboard.</p>
        </div>
      </div>
    </div>
  );
};
