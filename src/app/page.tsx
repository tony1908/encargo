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
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white font-medium">C</span>
            </div>
            <span className="text-lg font-medium text-gray-900">CargoEncar</span>
          </div>
          <button
            onClick={() => {
              login();
              setTimeout(() => {
                (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
              }, 150);
            }}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-medium text-gray-900 leading-tight">
                Container Insurance
                <span className="block text-gray-400 mt-2">Made Simple</span>
              </h1>
              <p className="text-lg text-gray-600 mt-6 leading-relaxed">
                Protect your cargo against delays with automated insurance coverage.
                Real-time tracking, instant claims, and daily compensation for late deliveries.
              </p>

              <button
                onClick={() => {
                  login();
                  setTimeout(() => {
                    (document.querySelector('input[type="email"]') as HTMLInputElement)?.focus();
                  }, 150);
                }}
                className="mt-8 px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6 mt-16">
                <div>
                  <div className="text-2xl font-medium text-gray-900">98%</div>
                  <div className="text-sm text-gray-500 mt-1">Claims Approved</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-gray-900">24h</div>
                  <div className="text-sm text-gray-500 mt-1">Fast Processing</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-gray-900">$5M+</div>
                  <div className="text-sm text-gray-500 mt-1">Protected Value</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative lg:block hidden">
              <div className="absolute inset-0 bg-gray-50 rounded-2xl"></div>
              <div className="relative p-12">
                {/* Ship Visual */}
                <div className="flex justify-center">
                  <div className="relative">
                    <svg width="300" height="300" viewBox="0 0 200 200" fill="none">
                      {/* Ocean waves */}
                      <path d="M0 150 Q50 130 100 150 T200 150 L200 200 L0 200 Z" fill="#f3f4f6"/>
                      <path d="M0 160 Q50 140 100 160 T200 160 L200 200 L0 200 Z" fill="#e5e7eb"/>

                      {/* Ship */}
                      <g transform="translate(100, 100)">
                        <rect x="-40" y="-10" width="80" height="40" rx="4" fill="white" stroke="#111827" strokeWidth="2"/>
                        <rect x="-25" y="-25" width="50" height="15" rx="2" fill="white" stroke="#111827" strokeWidth="2"/>
                        <rect x="-10" y="-40" width="20" height="15" rx="2" fill="white" stroke="#111827" strokeWidth="2"/>
                        {/* Container blocks */}
                        <rect x="-35" y="-8" width="15" height="12" fill="#111827" opacity="0.2"/>
                        <rect x="-18" y="-8" width="15" height="12" fill="#111827" opacity="0.2"/>
                        <rect x="-1" y="-8" width="15" height="12" fill="#111827" opacity="0.2"/>
                        <rect x="16" y="-8" width="15" height="12" fill="#111827" opacity="0.2"/>
                      </g>

                      {/* Route dots */}
                      <circle cx="30" cy="50" r="4" fill="#111827"/>
                      <circle cx="100" cy="100" r="6" fill="#111827"/>
                      <circle cx="170" cy="50" r="4" fill="#9ca3af"/>

                      {/* Route line */}
                      <path d="M30 50 Q65 75 100 100 T170 50" stroke="#d1d5db" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
                    </svg>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Coverage</div>
                    <div className="text-sm font-medium text-gray-900">1% Daily</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Tracking</div>
                    <div className="text-sm font-medium text-gray-900">Real-time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-gray-100 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke="#111827" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Full Protection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Comprehensive coverage for container delays with automated daily compensation
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#111827" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="#111827" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Instant Claims</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                File and process claims instantly with 24-hour payment guarantee
              </p>
            </div>
            <div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#111827" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="#111827" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Tracking</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Monitor your containers in real-time across global shipping routes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
