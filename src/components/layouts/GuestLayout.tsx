import {type ReactNode} from 'react';
import {Box, Center, Container, Group} from '@mantine/core';
import {Navigate} from 'react-router';
import {LanguageSwitcher} from '@/components/common/LanguageSwitcher';
import {ColorSchemeToggle} from '@/components/common/ColorSchemeToggle';
import {useAppStore} from '@/stores/useAppStore';

type GuestLayoutProps = {
  readonly children: ReactNode;
};

export function GuestLayout({children}: GuestLayoutProps) {
  const {isAuthenticated} = useAppStore();

  if (isAuthenticated) {
    return <Navigate replace to="/profile" />;
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
        <Container size={420} style={{width: '100%'}}>
          {children}
        </Container>
      </Center>
    </Box>
  );
}
