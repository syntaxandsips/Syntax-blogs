"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Github, Globe, Lock, Mail, ShieldCheck, Sparkles, Twitter, UserPlus, UserRound } from 'lucide-react';
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

  const comingSoonProviders = [Github, Twitter, Globe, Sparkles];

  return (
    <div className="neo-brutalism min-h-screen bg-[#F6EDE3] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border-4 border-black bg-white shadow-[12px_12px_0_0_rgba(0,0,0,0.25)]">
        <div
          className="absolute -left-10 -top-10 hidden h-40 w-40 rotate-12 rounded-full border-4 border-black bg-[#FFD66B] md:block"
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 border-b-4 border-black bg-white px-8 py-10 md:border-b-0 md:border-r-4">
            <div className="mx-auto w-full max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-[#F6EDE3] px-4 py-1 text-xs font-black uppercase tracking-widest text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                <Sparkles className="mr-2 h-4 w-4 text-[#FF8A65]" aria-hidden="true" />
                Start your journey
              </span>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Create your Syntax &amp; Sips account</h1>
              <p className="mt-2 text-sm font-medium text-gray-600">
                Join our community for developer stories, coding hangouts, and exclusive updates.
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
                  <label
                    htmlFor="display-name"
                    className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                  >
                    Display name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF8A65]" aria-hidden="true" />
                    <input
                      id="display-name"
                      name="displayName"
                      type="text"
                      className="w-full rounded-lg border-2 border-black px-4 py-2 pl-11 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/50"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signup-email"
                    className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C63FF]" aria-hidden="true" />
                    <input
                      id="signup-email"
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
                  <label
                    htmlFor="signup-password"
                    className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FF5252]" aria-hidden="true" />
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-2 pl-11 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#FF5252]/40"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="signup-confirm-password"
                    className="block text-xs font-bold uppercase tracking-wide text-gray-700"
                  >
                    Confirm password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2E7D32]" aria-hidden="true" />
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-2 pl-11 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#FF5252]/40"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#FF8A65] px-6 py-3 text-base font-black uppercase tracking-wide text-black shadow-[5px_5px_0_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.3)] disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
                >
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm font-medium text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-[#6C63FF] underline"
                  onClick={() => router.push(`/login${redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : ''}`)}
                >
                  Sign in
                </button>
              </p>

              <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                <ShieldCheck className="h-4 w-4 text-[#2E7D32]" aria-hidden="true" />
                Admin access is handled separately from the dashboard
              </p>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-6 bg-[#FCD7A5] px-8 py-12 text-center md:px-10">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_rgba(252,215,165,0))]"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-xs">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-widest text-gray-900 shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                Welcome to the digital brew
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-gray-900">Where code meets conversation</h2>
              <p className="mt-3 text-sm font-medium text-gray-700">
                Dive into curated tutorials, podcast recaps, and behind-the-scenes updates delivered straight to your inbox.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-xs flex-col gap-3">
              <div className="grid grid-cols-4 gap-3 text-sm font-semibold text-gray-800">
                {comingSoonProviders.map((Icon, index) => (
                  <span
                    key={`provider-${index}`}
                    className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,0.15)]"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                Social sign-ons coming soon
              </p>
            </div>

            <div className="relative text-sm font-semibold text-gray-700">
              <p>
                Already collaborating with the Syntax &amp; Sips team?{' '}
                <Link href="/admin/login" className="text-[#FF5252] underline">
                  Head to the admin login
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
