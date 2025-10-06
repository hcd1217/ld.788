import React from 'react';

import { Affix, Container, LoadingOverlay, Text } from '@mantine/core';

import { isDevelopment } from '@/utils/env';

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
    <Container fluid p="sm" mt="sm">
      <ErrorAlert error={error} clearError={clearError} />
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ blur: 2 }}
        transitionProps={{ duration: 300 }}
      />
      {children}
      {isDevelopment && (
        <Affix position={{ top: 10, left: window.innerWidth / 2 }}>
          <Text
            c="orange"
            fz={20}
            fw={600}
            w="100%"
            ta="left"
            style={{ fontStyle: 'italic' }}
            pl="sm"
          >
            Backend: {import.meta.env.VITE_API_URL}
          </Text>
        </Affix>
      )}
    </Container>
  );
}
