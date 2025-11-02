"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";

export default function Home() {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (ready && authenticated) {
      // Redirect to dashboard or return URL after successful login
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        router.push('/dashboard');
      }
    }
  }, [ready, authenticated, router, searchParams]);

  if (!ready) {
    return <FullScreenLoader />;
  }

  // Show loading while redirecting authenticated users
  if (authenticated) {
    return <FullScreenLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-slate-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Insurance Dashboard</h1>
        <button
          onClick={() => {
            login();
            setTimeout(() => {
              (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
            }, 150);
          }}
          className="rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}
