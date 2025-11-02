'use client';

import { ProtectedRoute } from '@/providers/auth-provider';
import { Header } from '@/components/ui/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-white via-white to-slate-50">
        <Header />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
