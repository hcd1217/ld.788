import { Avatar, Group, Menu, Text, UnstyledButton, rem } from '@mantine/core';
import { IconCaretDownFilled, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import classes from './AuthLayout.module.css';
import { VersionInformation } from '@/components/common';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { ROUTERS } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';

interface UserMenuProps {
  readonly c?: string;
}

export function UserMenu({ c }: UserMenuProps) {
  const navigate = useNavigate();
  const { user, logout } = useAppStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate(ROUTERS.LOGIN);
  };

  const userInitials = user ? `${user.email.charAt(0).toUpperCase()}` : 'U';

  return (
    <Menu
      shadow="md"
      width={LAYOUT_CONFIG.USER_MENU_WIDTH}
      position="bottom-end"
      transitionProps={{ transition: 'pop-top-right' }}
    >
      <Menu.Target>
        <UnstyledButton
          className={classes.userMenuButton}
          aria-label={t('common.userMenu')}
          aria-haspopup="true"
        >
          <Group gap={7}>
            <Avatar radius="xl" size="md" color="brand" c={c}>
              {userInitials}
            </Avatar>
            <Text fw={500} size="sm" lh={1} mr={3} c={c}>
              {user?.email}
            </Text>
            <IconCaretDownFilled
              color={c}
              className={classes.userMenuIcon}
              stroke={1.5}
              aria-hidden="true"
            />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('common.account')}</Menu.Label>
        <Menu.Item
          leftSection={
            <IconUser
              style={{
                width: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
                height: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
              }}
              aria-hidden="true"
            />
          }
          onClick={() => navigate(ROUTERS.PROFILE)}
        >
          {t('common.profile')}
        </Menu.Item>
        <Menu.Item
          leftSection={
            <IconSettings
              style={{
                width: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
                height: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
              }}
              aria-hidden="true"
            />
          }
          onClick={() => navigate(ROUTERS.SETTINGS)}
        >
          {t('common.settings')}
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={
            <IconLogout
              style={{
                width: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
                height: rem(LAYOUT_CONFIG.USER_MENU_ICON_SIZE),
              }}
              aria-hidden="true"
            />
          }
          onClick={handleLogout}
        >
          {t('common.logout')}
        </Menu.Item>
        <VersionInformation />
      </Menu.Dropdown>
    </Menu>
  );
}
