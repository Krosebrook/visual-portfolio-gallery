import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { blink } from '@/lib/blink';
import { Spinner } from './ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(({ user, isLoading }) => {
      setUser(user);
      if (!isLoading) {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary" />
          <p className="text-muted-foreground animate-pulse font-serif italic">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home or login, passing the current location as state
    // For Blink managed auth, we use redirectUrl.
    const redirectUrl = `${window.location.origin}${location.pathname}${location.search}`;
    blink.auth.login(redirectUrl);
    return null;
  }

  return <>{children}</>;
}
