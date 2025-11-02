'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ProfileButton } from "./profile-button";

export function Header() {
  const { logout } = usePrivy();

  return (
    <header className="h-[60px] flex flex-row justify-between items-center px-6 border-b bg-white border-[#E2E3F0]">
      <div className="flex flex-row items-center gap-2 h-[26px]">
        <h1 className="text-xl font-abc-favorit font-medium">Dashboard</h1>
      </div>

      <div className="flex flex-row justify-end items-center gap-4 h-9">
        <ProfileButton />
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
