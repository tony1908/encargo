"use client";

import Image from "next/image";
import { usePrivy } from '@privy-io/react-auth';
import { ProfileButton } from "@/components/ui/profile-button";

export default function Home() {
  const { logout } = usePrivy();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-slate-50">
      {/* Header */}
      <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="" alt="Namespace" width={32} height={32} />
          </div>
          <div className="flex items-center gap-4">
            <ProfileButton />
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:py-12">

      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <div></div>
          <div className="flex gap-4 mt-2 sm:mt-0">

          </div>
        </div>
      </footer>
    </div>
  );
}
