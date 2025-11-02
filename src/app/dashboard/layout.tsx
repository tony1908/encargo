'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/providers/auth-provider';
import { Header } from '@/components/ui/header';
import { Sidebar } from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex">
        {/* Sidebar */}
        <Sidebar isExpanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />

        {/* Main content area */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarExpanded ? 'ml-56' : 'ml-16'}`}>
          <Header />
          <main className="flex-1 bg-white">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
