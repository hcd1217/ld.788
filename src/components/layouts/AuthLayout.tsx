import { Outlet } from 'react-router';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { AppLogo, ColorSchemeToggle, LanguageSwitcher } from '@/components/common';
import { RoleSelector } from '@/components/debug/RoleSelector';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useAppStore } from '@/stores/useAppStore';

import { NavBar } from './NavBar';
import { NavBarSkeleton } from './NavBarSkeleton';
import { UserMenu } from './UserMenu';

export function AuthLayout() {
  const [isMenuOpen, { toggle: toggleMenu }] = useDisclosure(true);
  const { isMobile } = useDeviceType();

  // Check if user profile is loading
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const user = useAppStore((state) => state.user);
  const isProfileLoading = isAuthenticated && !user;

  if (isMobile) {
    return <Outlet />;
  }

  // Dynamic calculation of main padding based on navbar state
  const mainPaddingLeft = isMenuOpen ? `${LAYOUT_CONFIG.NAVBAR_ACTUAL_WIDTH}px` : '0';

  return (
    <AppShell
      header={{ height: LAYOUT_CONFIG.HEADER_HEIGHT }}
      navbar={{
        width: isMenuOpen
          ? LAYOUT_CONFIG.NAVBAR_WIDTH_EXPANDED
          : LAYOUT_CONFIG.NAVBAR_WIDTH_COLLAPSED,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Header bg="var(--app-shell-background-color)" withBorder={false}>
        <Group h="100%" px="sm" justify="space-between">
          <Group>
            <AppLogo c="var(--app-shell-color)" fw={400} />
            <Burger
              visibleFrom="sm"
              size="xs"
              color="var(--app-shell-color)"
              aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            />
          </Group>
          <Group>
            <Group visibleFrom="sm">
              <RoleSelector />
              <LanguageSwitcher />
              <ColorSchemeToggle />
            </Group>
            <UserMenu c="var(--app-shell-color)" />
          </Group>
        </Group>
      </AppShell.Header>
      {isMenuOpen ? isProfileLoading ? <NavBarSkeleton /> : <NavBar /> : null}
      <AppShell.Main pl={mainPaddingLeft}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
