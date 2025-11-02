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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12 justify-center">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <span className="text-white font-medium">C</span>
          </div>
          <span className="text-xl font-medium text-gray-900">CargoEncar</span>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Cargo insurance platform</p>
          </div>

          <button
            onClick={() => {
              login();
              setTimeout(() => {
                (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
              }, 150);
            }}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue
          </button>

          <div className="text-center">
            <button
              onClick={() => login()}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Create account
            </button>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-medium text-gray-900">98%</div>
              <div className="text-xs text-gray-500">Claims</div>
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900">24h</div>
              <div className="text-xs text-gray-500">Response</div>
            </div>
            <div>
              <div className="text-lg font-medium text-gray-900">$5M</div>
              <div className="text-xs text-gray-500">Protected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
