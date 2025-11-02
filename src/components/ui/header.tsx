'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import { ProfileButton } from "./profile-button";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <ProfileButton />
      </div>
    </header>
  );
}
