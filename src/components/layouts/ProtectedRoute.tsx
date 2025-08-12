import React from 'react';
import { Navigate } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';
import { NoPermission } from '@/components/common';

type ProtectedRouteProps = {
  readonly children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Use separate selectors to avoid creating new objects on every render
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const permissionError = useAppStore((state) => state.permissionError);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  // Authenticated but no permission - show NoPermission component
  if (permissionError) {
    return <NoPermission />;
  }

  // Authenticated and has permission - render children
  return children as React.ReactElement;
}
