'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  ShoppingCartIcon,
  MapIcon,
  ClockIcon,
  BanknotesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
      description: 'Overview'
    },
    {
      name: 'Buy Insurance',
      icon: ShoppingCartIcon,
      path: '/dashboard/buy',
      description: 'Protect your cargo'
    },
    {
      name: 'Track Container',
      icon: MapIcon,
      path: '/dashboard/track',
      description: 'Real-time tracking'
    },
    {
      name: 'Delivery Status',
      icon: ClockIcon,
      path: '/dashboard/status',
      description: 'Check status'
    },
    {
      name: 'Claim Insurance',
      icon: BanknotesIcon,
      path: '/dashboard/claim',
      description: 'File a claim'
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          w-72 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:transform-none lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">CargoEncar</h1>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                <div className="flex flex-col items-start">
                  <span className="text-sm">{item.name}</span>
                  <span className={`text-xs ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="absolute bottom-6 left-4 right-4 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
          <p className="text-xs font-medium text-gray-900 mb-1">Need Help?</p>
          <p className="text-xs text-gray-600">
            Contact support for assistance with your insurance claims.
          </p>
        </div>
      </aside>
    </>
  );
}
