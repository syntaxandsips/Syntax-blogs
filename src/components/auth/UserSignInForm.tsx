"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, BookmarkCheck, Mail, Lock, Mic2, Newspaper, ShieldAlert, Sparkles } from 'lucide-react';
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

  const features = [
    {
      icon: BookmarkCheck,
      label: 'Personalized reading queue',
    },
    {
      icon: Mic2,
      label: 'Early access to live sessions',
    },
    {
      icon: Newspaper,
      label: 'Members-only changelog highlights',
    },
  ];

  return (
    <div className="neo-brutalism min-h-screen bg-[#F6EDE3] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-[32px] border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,0.2)]">
        <div
          className="absolute -left-16 -top-14 hidden h-44 w-44 rotate-6 rounded-full border-4 border-black bg-[#FFD66B] md:block"
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10 border-b-4 border-black bg-white px-8 py-8 md:border-b-0 md:border-r-4">
            <div className="mx-auto w-full max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-[#F6EDE3] px-4 py-1 text-xs font-black uppercase tracking-widest text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.18)]">
                <Sparkles className="mr-2 h-4 w-4 text-[#FF8A65]" aria-hidden="true" />
                Syntax &amp; Sips insiders
              </span>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Welcome back!</h1>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Sign in with your Syntax &amp; Sips account to sync your reading list and follow the latest drops.
              </p>

              {error && (
                <div
                  className="mt-6 rounded-lg border-2 border-red-500 bg-red-100 p-4 text-sm font-semibold text-red-700"
                  role="alert"
                >
                  <p>{error}</p>
                </div>
              )}

              {info && (
                <div
                  className="mt-6 rounded-lg border-2 border-green-500 bg-green-100 p-4 text-sm font-semibold text-green-700"
                  role="status"
                >
                  <p>{info}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C63FF]" aria-hidden="true" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-2 pl-11 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/50"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF5252]" aria-hidden="true" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-2 pl-11 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#FF5252]/40"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#6C63FF] px-6 py-3 text-base font-black uppercase tracking-wide text-white shadow-[5px_5px_0_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.3)] disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
                >
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm font-medium text-gray-600">
                Need an account?{' '}
                <button
                  type="button"
                  className="text-[#6C63FF] underline"
                  onClick={() => router.push(`/signup${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`)}
                >
                  Create one now
                </button>
              </p>

              <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                Admins should continue using the dedicated admin sign-in page
              </p>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-6 bg-[#FCD7A5] px-8 py-10 text-center md:px-12">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(252,215,165,0))]"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-sm">
              <h2 className="mt-6 text-3xl font-black tracking-tight text-gray-900">Stay in sync with the crew</h2>
              <p className="mt-3 text-sm font-medium text-gray-700">
                Access saved posts, queue up podcasts, and pick up where you left off across devices.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-xs flex-col gap-3 text-left text-sm font-semibold text-gray-700">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-[5px_5px_0_0_rgba(0,0,0,0.15)]">
                <p className="flex items-center gap-2 uppercase tracking-wide text-xs text-[#FF8A65]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  What you get
                </p>
                <ul className="mt-3 space-y-3">
                  {features.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-2 border-black bg-[#F6EDE3] text-[#FF8A65] shadow-[3px_3px_0_0_rgba(0,0,0,0.12)]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative text-sm font-semibold text-gray-800">
              <p>
                Part of the editorial or ops team?{' '}
                <Link href="/admin/login" className="text-[#FF5252] underline">
                  Use the admin login
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
