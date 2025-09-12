import { AppShell, Box, Loader } from '@mantine/core';

import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useTranslation } from '@/hooks/useTranslation';

export function NavBarSkeleton() {
  const { t } = useTranslation();

  return (
    <AppShell.Navbar
      p="0"
      bg="var(--menu-background-color)"
      c="var(--app-shell-color)"
      withBorder={false}
      w={LAYOUT_CONFIG.NAVBAR_ACTUAL_WIDTH}
      role="navigation"
      aria-label={t('common.loadingNavigation')}
      aria-busy="true"
    >
      <Box
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader size="sm" color="dimmed" />
      </Box>
    </AppShell.Navbar>
  );
}
