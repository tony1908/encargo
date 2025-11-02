'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/providers/auth-provider';
import { Header } from '@/components/ui/header';
import { Sidebar } from '@/components/ui/sidebar';
import { Footer } from '@/components/ui/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 bg-gray-50">{children}</main>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
