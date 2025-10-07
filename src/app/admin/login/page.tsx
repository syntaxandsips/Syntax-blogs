import { Suspense } from 'react';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="neo-brutalism min-h-screen flex items-center justify-center bg-white p-4">
          <div className="neo-container w-full max-w-md p-8 text-center font-bold">Loading...</div>
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
