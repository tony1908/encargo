'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import {
  HomeIcon,
  ShoppingCartIcon,
  MapIcon,
  ClockIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = usePrivy();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
    },
    {
      name: 'Buy Insurance',
      icon: ShoppingCartIcon,
      path: '/dashboard/buy',
    },
    {
      name: 'Track',
      icon: MapIcon,
      path: '/dashboard/track',
    },
    {
      name: 'Status',
      icon: ClockIcon,
      path: '/dashboard/status',
    },
    {
      name: 'Claims',
      icon: BanknotesIcon,
      path: '/dashboard/claim',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-56' : 'w-16'}
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 relative">
        {isExpanded ? (
          <div className="flex items-center gap-2 px-4">
            <div className="w-7 h-7 bg-black rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">C</span>
            </div>
            <span className="font-medium text-gray-900">CargoEncar</span>
          </div>
        ) : (
          <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
            <span className="text-white font-medium text-sm">C</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
      >
        {isExpanded ? (
          <ChevronLeftIcon className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronRightIcon className="w-3 h-3 text-gray-600" />
        )}
      </button>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <div key={item.path} className="relative">
              <button
                onClick={() => handleNavigation(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }
                  ${!isExpanded ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                {isExpanded && (
                  <span className={`text-sm ${isActive ? 'text-white font-medium' : ''}`}>
                    {item.name}
                  </span>
                )}
              </button>

              {/* Tooltip for collapsed state */}
              {!isExpanded && hoveredItem === item.path && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section - Help and Logout */}
      <div className="absolute bottom-4 left-2 right-2 space-y-2">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-500 hover:bg-gray-50 transition-all
            ${!isExpanded ? 'justify-center' : ''}
          `}
        >
          <QuestionMarkCircleIcon className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm">Help</span>}
        </button>

        <button
          onClick={logout}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-600 hover:bg-gray-50 transition-all relative
            ${!isExpanded ? 'justify-center' : ''}
          `}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm">Logout</span>}

          {/* Tooltip for collapsed state */}
          {!isExpanded && hoveredItem === 'logout' && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
