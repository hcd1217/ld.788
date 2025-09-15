import { AppShell, Box, Loader } from '@mantine/core';

import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export function NavBarSkeleton() {
  return (
    <AppShell.Navbar
      p="0"
      bg="var(--menu-background-color)"
      c="var(--app-shell-color)"
      withBorder={false}
      w={LAYOUT_CONFIG.NAVBAR_ACTUAL_WIDTH}
      role="navigation"
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
