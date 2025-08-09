import { type ReactNode } from 'react';
import { Affix, Box, Center, Container, Group } from '@mantine/core';
import { Navigate } from 'react-router';
import { VersionInformation } from '../common';
import { LanguageSwitcher, ColorSchemeToggle } from '@/components/common';
import { useAppStore } from '@/stores/useAppStore';

type GuestLayoutProps = {
  readonly children: ReactNode;
};

/**
 * Layout for guest-only (public) pages such as login or password reset.
 *
 * - Redirects authenticated users to "/home".
 * - Fills the viewport and centers `children` within a constrained container.
 * - Displays `ColorSchemeToggle`, `LanguageSwitcher`, and `VersionInformation`.
 *
 * @param children Content to render for unauthenticated users.
 */
export function GuestLayout({ children }: GuestLayoutProps) {
  const { isAuthenticated } = useAppStore();

  if (isAuthenticated) {
    return <Navigate replace to="/home" />;
  }

  return (
    <Box
      style={{
        height: '100dvh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        WebkitOverflowScrolling: 'auto',
        touchAction: 'none',
      }}
    >
      <Group
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 10,
        }}
        gap="sm"
      >
        <ColorSchemeToggle />
        <LanguageSwitcher />
      </Group>
      <Center
        style={{
          height: '100%',
          width: '100%',
          padding: '1rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container size={420} style={{ width: '100%' }}>
          {children}
        </Container>
      </Center>
      <Affix position={{ bottom: 0, right: 0 }} p="sm">
        <VersionInformation />
      </Affix>
    </Box>
  );
}
