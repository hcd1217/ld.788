import React from 'react';

import { Navigate } from 'react-router';

import { LoadingOverlay } from '@mantine/core';

import { useAppStore, useMe } from '@/stores/useAppStore';

type ProtectedRouteProps = {
  readonly children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Use separate selectors to avoid creating new objects on every render
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const currentUser = useMe();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  // Waiting for current user to be loaded
  if (!currentUser) {
    return <LoadingOverlay visible={true} />;
  }

  // Authenticated and has permission - render children
  return children as React.ReactElement;
}
