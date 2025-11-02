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
    <div className="min-h-screen bg-white flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-2xl font-bold text-white">CargoEncar</h1>
          </div>

          <div className="space-y-8 mt-20">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Protect Your Cargo<br />
              <span className="text-indigo-200">Against Delays</span>
            </h2>
            <p className="text-lg text-indigo-100 max-w-md">
              Real-time container tracking with comprehensive insurance coverage.
              Get compensated for every day of delay.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-white">
          <div>
            <div className="text-3xl font-bold">98%</div>
            <div className="text-sm text-indigo-200">Claims Approved</div>
          </div>
          <div>
            <div className="text-3xl font-bold">24h</div>
            <div className="text-sm text-indigo-200">Response Time</div>
          </div>
          <div>
            <div className="text-3xl font-bold">$5M+</div>
            <div className="text-sm text-indigo-200">Protected Value</div>
          </div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CargoEncar</h1>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to manage your cargo insurance</p>
          </div>

          <button
            onClick={() => {
              login();
              setTimeout(() => {
                (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
              }, 150);
            }}
            className="w-full rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all hover:shadow-xl"
          >
            Sign In
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to CargoEncar?</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => login()}
              className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors"
            >
              Create an account
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
              <div>
                <div className="font-semibold text-gray-900">Instant</div>
                <div>Coverage</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Real-time</div>
                <div>Tracking</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Fast</div>
                <div>Claims</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
