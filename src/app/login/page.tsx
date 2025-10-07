import { Suspense } from 'react';
import { UserSignInForm } from '@/components/auth/UserSignInForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
          <div className="neo-container w-full max-w-md p-8 text-center font-bold">Loading...</div>
        </div>
      }
    >
      <UserSignInForm />
    </Suspense>
  );
}
