import {AppShell, Group} from '@mantine/core';
import {Outlet} from 'react-router';
import {ColorSchemeToggle} from '@/components/common/ColorSchemeToggle';
import {LanguageSwitcher} from '@/components/common/LanguageSwitcher';
import {AppLogo} from '@/components/common/AppLogo';

/*
 * @deprecated
 * This layout is no longer used.
 * It is only used for the old version of the app.
 * The new version of the app uses the AuthLayout.
 */
export function AppLayout() {
  return (
    <AppShell header={{height: 60}} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <AppLogo />
          <Group>
            <LanguageSwitcher />
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
