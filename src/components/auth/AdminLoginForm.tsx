"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, KeyRound, Lock, LogIn, Mail, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
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
      description: 'Only profiles flagged as admins in Supabase can enter the dashboard.',
    },
    {
      icon: Activity,
      title: 'Live editorial metrics',
      description: 'Monitor story performance and publishing cadence in real time.',
    },
    {
      icon: KeyRound,
      title: 'Secure by design',
      description: 'Audit-ready authentication powered by Supabase Auth and row-level security.',
    },
  ];

  return (
    <div className="neo-brutalism min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border-4 border-black bg-[#0B1220] text-white shadow-[12px_12px_0_0_rgba(0,0,0,0.35)]">
        <div
          className="absolute -right-16 -top-16 hidden h-48 w-48 -rotate-12 rounded-full border-4 border-black bg-[#38BDF8] md:block"
          aria-hidden="true"
        />
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 border-b-4 border-black px-8 py-10 md:border-b-0 md:border-r-4 md:px-10">
            <div className="mx-auto w-full max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-[#0F172A] px-4 py-1 text-xs font-black uppercase tracking-widest text-[#38BDF8] shadow-[4px_4px_0_0_rgba(0,0,0,0.4)]">
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Syntax &amp; Sips admin portal
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white">Welcome to the control room</h1>
              <p className="mt-2 text-sm font-medium text-slate-200">
                Use your admin credentials to ship updates, schedule features, and keep the content pipeline humming.
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

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wide text-slate-200">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#38BDF8]" aria-hidden="true" />
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-lg border-2 border-white/20 bg-[#101B33] px-4 py-2 pl-11 text-sm font-semibold text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.35)] focus:outline-none focus:ring-4 focus:ring-[#38BDF8]/50"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wide text-slate-200">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#38BDF8]" aria-hidden="true" />
                    <input
                      id="admin-password"
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-lg border-2 border-white/20 bg-[#101B33] px-4 py-2 pl-11 text-sm font-semibold text-white shadow-[3px_3px_0_0_rgba(0,0,0,0.35)] focus:outline-none focus:ring-4 focus:ring-[#38BDF8]/50"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex w-full items-center justify-center rounded-xl border-2 border-black bg-[#38BDF8] px-6 py-3 text-base font-black uppercase tracking-wide text-[#0B1220] shadow-[5px_5px_0_0_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1 hover:shadow-[7px_7px_0_0_rgba(0,0,0,0.45)] disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
                >
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  {isLoading ? 'Logging in…' : 'Enter dashboard'}
                </button>
              </form>

              <div className="mt-6 space-y-3 rounded-2xl border-2 border-white/10 bg-[#101B33]/70 p-4 text-xs font-semibold text-slate-200">
                <p className="flex items-start gap-2">
                  <KeyRound className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#38BDF8]" aria-hidden="true" />
                  Use the Supabase credentials for your admin profile. Accounts must have <code className="rounded bg-white/10 px-1 py-0.5">is_admin</code> enabled in the <code className="rounded bg-white/10 px-1 py-0.5">profiles</code> table.
                </p>
                <p className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#34D399]" aria-hidden="true" />
                  Need a demo identity? Run <code className="rounded bg-white/10 px-1 py-0.5">npm run seed:test-user</code> to recreate <code className="rounded bg-white/10 px-1 py-0.5">test.admin@syntaxblogs.dev</code> with the default password.
                </p>
              </div>

              <p className="mt-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ShieldAlert className="mr-2 inline h-4 w-4 align-[-0.2em] text-[#F87171]" aria-hidden="true" />
                Trying to access reader features? <Link href="/login" className="text-[#38BDF8] underline">Head to the member login</Link>.
              </p>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-6 bg-[#13203A] px-8 py-12 text-left md:px-12">
            <div
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.3),_rgba(19,32,58,0))]"
              aria-hidden="true"
            />
            <div className="relative max-w-sm">
              <span className="inline-flex items-center rounded-full border-2 border-black bg-[#0F172A] px-4 py-1 text-xs font-black uppercase tracking-widest text-[#38BDF8] shadow-[4px_4px_0_0_rgba(0,0,0,0.45)]">
                Mission control brief
              </span>
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white">Keep the editorial engine running</h2>
              <p className="mt-3 text-sm font-medium text-slate-200">
                Configure the homepage, curate spotlight stories, and coordinate drops with the rest of the Syntax &amp; Sips crew.
              </p>
            </div>

            <div className="relative space-y-4 text-sm font-semibold text-slate-200">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-2xl border-2 border-black bg-[#0F172A] p-4 shadow-[5px_5px_0_0_rgba(0,0,0,0.45)]"
                >
                  <span className="mt-1 inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#38BDF8] bg-[#101B33] text-[#38BDF8]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-base font-black text-white">{title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-300">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative rounded-2xl border-2 border-white/10 bg-[#101B33]/70 p-4 text-xs font-semibold text-slate-300">
              <p>
                Deployment tip: ensure the <code className="rounded bg-white/10 px-1 py-0.5">profiles</code> table is migrated before seeding so the admin flag persists across environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
