'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter, usePathname } from 'next/navigation';
import { FullScreenLoader } from '@/components/ui/fullscreen-loader';

interface AuthContextType {
  isAuthenticated: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => Promise<void>;
  user: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const value: AuthContextType = {
    isAuthenticated: authenticated,
    isReady: ready,
    login,
    logout,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: string;
}

export function ProtectedRoute({ children, fallback = '/' }: ProtectedRouteProps) {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !authenticated) {
      // Store the intended destination
      const returnUrl = encodeURIComponent(pathname);
      router.push(`${fallback}?returnUrl=${returnUrl}`);
    }
  }, [ready, authenticated, router, pathname, fallback]);

  // Show loader while checking auth status
  if (!ready) {
    return <FullScreenLoader />;
  }

  // Show loader while redirecting
  if (!authenticated) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}
