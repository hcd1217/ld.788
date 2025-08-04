import React from 'react';
import { Container, LoadingOverlay, Stack } from '@mantine/core';
import { ErrorAlert } from '../feedback';

type AppDesktopLayoutProps = {
  readonly children: React.ReactNode;
  readonly isLoading?: boolean;
  readonly error?: string;
  readonly clearError?: () => void;
};
export function AppDesktopLayout({
  children,
  isLoading,
  error,
  clearError,
}: AppDesktopLayoutProps) {
  return (
    <Container fluid px="sm" mt="sm">
      <ErrorAlert error={error} clearError={clearError} />
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ blur: 2 }}
        transitionProps={{ duration: 300 }}
      />
      <Stack gap="xl">{children}</Stack>
    </Container>
  );
}
