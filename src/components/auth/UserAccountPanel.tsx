"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { syncAuthState } from '@/lib/supabase/sync-auth-state';
import '@/styles/neo-brutalism.css';

interface UserAccountPanelProps {
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export const UserAccountPanel = ({ email, displayName, isAdmin }: UserAccountPanelProps) => {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [error, setError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setError('');
    setIsSigningOut(true);

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setIsSigningOut(false);
      return;
    }

    await syncAuthState('SIGNED_OUT', null);
    router.replace('/login');
  };

  return (
    <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
      <div className="neo-container w-full max-w-xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}!</h1>
          <p className="text-gray-600 mt-1">Signed in as {email}</p>
        </div>

        <div className="space-y-4">
          <section className="border border-black p-4 bg-white">
            <h2 className="font-semibold text-lg">Account access</h2>
            <p className="text-sm text-gray-600 mt-1">
              You are signed in with a community account.{' '}
              {isAdmin ? (
                <span className="font-semibold text-purple-600">
                  You also have admin permissions.
                </span>
              ) : (
                <span>
                  If you contribute content or moderate comments, an admin can upgrade your permissions.
                </span>
              )}
            </p>
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex items-center mt-3 px-4 py-2 border-2 border-black bg-black text-white font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px]"
              >
                Go to admin dashboard
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="inline-flex items-center mt-3 text-sm text-purple-600 underline"
              >
                Admins sign in here
              </Link>
            )}
          </section>

          <section className="border border-black p-4 bg-white">
            <h2 className="font-semibold text-lg">Sign out</h2>
            <p className="text-sm text-gray-600 mt-1">Finished browsing? You can sign out safely below.</p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="mt-3 neo-button px-4 py-2 font-bold"
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </button>
            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
