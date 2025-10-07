"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import '@/styles/neo-brutalism.css';
import { createBrowserClient } from '@/lib/supabase/client';
import { syncAuthState } from '@/lib/supabase/sync-auth-state';
import { useSupabaseAuthSync } from '@/hooks/useSupabaseAuthSync';

export const AdminLoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createBrowserClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const syncSession = useCallback(
    async (event: AuthChangeEvent, session: Session | null) => {
      await syncAuthState(event, session);
    },
    [],
  );

  useSupabaseAuthSync(supabase);

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

      await syncSession('SIGNED_IN', session);

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
  }, [router, supabase, syncSession]);

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
      await syncSession('SIGNED_IN', data.session);
    }

    setInfo('Login successful! Redirecting to the dashboard...');
    router.replace('/admin');
  };

  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Protected workspace',
      description: 'Only Supabase profiles with the admin flag see the dashboard.',
    },
    {
      icon: Activity,
      title: 'Live editorial metrics',
      description: 'Track story performance and publishing cadence at a glance.',
    },
    {
      icon: KeyRound,
      title: 'Secure by design',
      description: 'Supabase Auth plus row-level security keeps newsroom data locked down.',
    },
  ];

  return (
    <div className="neo-brutalism min-h-screen bg-[#DDE6FF] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border-4 border-black bg-[#F2F5FF] text-slate-900 shadow-[12px_12px_0_0_rgba(0,0,0,0.25)]">
        <div
          className="absolute -left-20 -top-20 hidden h-48 w-48 rotate-6 rounded-full border-4 border-black bg-[#99B5FF] md:block"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-16 hidden h-56 w-56 -rotate-12 rounded-full border-4 border-black bg-[#C1D4FF] md:block"
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 border-b-4 border-black bg-white px-8 py-10 md:border-b-0 md:border-r-4 md:px-12">
            <div className="mx-auto w-full max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-[#E8EEFF] px-4 py-1 text-xs font-black uppercase tracking-widest text-[#1D4ED8] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Syntax &amp; Sips admin portal
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">Welcome back, captain</h1>
              <p className="mt-2 text-sm font-medium text-slate-600">
                Sign in with your admin credentials to publish updates, review pitches, and keep Syntax &amp; Sips running smoothly.
              </p>

              {error && (
                <div
                  className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-[#F87171] bg-[#7F1D1D]/60 p-4 text-sm font-semibold text-red-100"
                  role="alert"
                >
                  <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              {info && (
                <div
                  className="mt-6 flex items-start gap-3 rounded-2xl border-2 border-[#34D399] bg-[#064E3B]/60 p-4 text-sm font-semibold text-emerald-100"
                  role="status"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <p>{info}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563EB]" aria-hidden="true" />
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-3 pl-11 text-sm font-semibold text-slate-900 shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/40"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wide text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2563EB]" aria-hidden="true" />
                    <input
                      id="admin-password"
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-lg border-2 border-black px-4 py-3 pl-11 text-sm font-semibold text-slate-900 shadow-[3px_3px_0_0_rgba(0,0,0,0.15)] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/40"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#2563EB] px-6 py-3 text-base font-black uppercase tracking-wide text-white shadow-[5px_5px_0_0_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.3)] disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
                >
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  {isLoading ? 'Logging in…' : 'Sign in'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ShieldAlert className="mr-2 inline h-4 w-4 align-[-0.2em] text-rose-500" aria-hidden="true" />
                Trying to access reader features? <Link href="/login" className="text-[#2563EB] underline">Head to the member login</Link>.
              </p>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-8 bg-[#E8EEFF] px-8 py-12 text-left md:px-12">
            <div className="relative max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-widest text-[#2563EB] shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                Stay in sync with the crew
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900">Drive the Syntax &amp; Sips newsroom</h2>
              <p className="mt-3 text-sm font-medium text-slate-600">
                Keep the editorial engine humming with quick reviews and decisive publishing.
              </p>
            </div>

            <div className="relative rounded-2xl border-2 border-black bg-white p-5 text-sm font-semibold text-slate-700 shadow-[5px_5px_0_0_rgba(0,0,0,0.2)]">
              <ul className="space-y-4">
                {highlights.map(({ icon: Icon, title, description }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#2563EB] bg-[#E8EEFF] text-[#2563EB]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-base font-black text-slate-900">{title}</p>
                      <p className="mt-1 text-xs font-medium text-slate-600">{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
