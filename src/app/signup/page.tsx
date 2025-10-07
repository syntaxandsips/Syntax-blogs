import { Suspense } from 'react';
import { UserSignUpForm } from '@/components/auth/UserSignUpForm';

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
          <div className="neo-container w-full max-w-md p-8 text-center font-bold">Loading...</div>
        </div>
      }
    >
      <UserSignUpForm />
    </Suspense>
  );
}
