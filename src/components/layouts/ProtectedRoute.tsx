import React from 'react';
import { Navigate } from 'react-router';
import { useAppStore } from '@/stores/useAppStore';

type ProtectedRouteProps = {
  readonly children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAppStore();

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children as React.ReactElement;
}
