import { Group } from '@mantine/core';
import { AppLogo, MobileUserMenu } from '../navigation';

export function CommonMobileHeader() {
  return (
    <Group h="100%" px="md" justify="space-between">
      <AppLogo />
      <MobileUserMenu />
    </Group>
  );
}
