import {
  AppShell,
  Group,
  Menu,
  Avatar,
  Text,
  rem,
  UnstyledButton,
  Stack,
  Switch,
  useMantineColorScheme,
  useComputedColorScheme,
} from '@mantine/core';
import {Outlet, useNavigate, useLocation} from 'react-router';
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconLayoutGrid,
  IconBell,
  IconSun,
  IconMoon,
  IconHome,
  IconDots,
} from '@tabler/icons-react';
import classes from './AuthLayoutMobile.module.css';
import {PWAInstallPrompt} from '@/components/common/PWAInstallPrompt';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {VersionInformation} from '@/components/common/VersionInformation';
import {AppLogo} from '@/components/common/AppLogo';

export function AuthLayoutMobile() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, logout} = useAppStore();
  const {t} = useTranslation();
  const {setColorScheme} = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = [
    {
      label: t('common.home'),
      icon: IconHome,
      path: '/home',
    },
    {
      label: t('common.explore'),
      icon: IconLayoutGrid,
      path: '/explore',
    },
    {
      label: t('common.notifications'),
      icon: IconBell,
      path: '/notifications',
    },
    {
      label: t('common.more'),
      icon: IconDots,
      path: '/more',
    },
  ];

  const userInitials = user ? `${user.email.charAt(0).toUpperCase()}` : 'U';

  function UserMenu() {
    return (
      <Menu
        shadow="md"
        width={200}
        position="bottom-end"
        transitionProps={{transition: 'pop-top-right'}}
      >
        <Menu.Target>
          <UnstyledButton>
            <Avatar radius="xl" size="md" color="brand">
              {userInitials}
            </Avatar>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{t('common.account')}</Menu.Label>
          <Menu.Item
            leftSection={<IconUser style={{width: rem(14), height: rem(14)}} />}
            onClick={() => navigate('/profile')}
          >
            {t('common.profile')}
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconSettings style={{width: rem(14), height: rem(14)}} />
            }
            onClick={() => navigate('/settings')}
          >
            {t('common.settings')}
          </Menu.Item>

          <Menu.Divider />

          <Menu.Label>{t('common.preferences')}</Menu.Label>
          <Menu.Item closeMenuOnClick={false}>
            <Group justify="space-between">
              <Group gap="xs">
                {computedColorScheme === 'light' ? (
                  <IconMoon style={{width: rem(14), height: rem(14)}} />
                ) : (
                  <IconSun style={{width: rem(14), height: rem(14)}} />
                )}
                <Text size="sm">{t('common.darkMode')}</Text>
              </Group>
              <Switch
                size="xs"
                checked={computedColorScheme === 'dark'}
                onChange={() =>
                  setColorScheme(
                    computedColorScheme === 'light' ? 'dark' : 'light',
                  )
                }
              />
            </Group>
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            color="red"
            leftSection={
              <IconLogout style={{width: rem(14), height: rem(14)}} />
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

  return (
    <AppShell
      header={{height: 60}}
      footer={{height: 60}}
      padding="md"
      className={classes.mobileLayout}
    >
      <AppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <AppLogo />

          <UserMenu />
        </Group>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Outlet />
        <PWAInstallPrompt />
      </AppShell.Main>

      <AppShell.Footer className={classes.footer}>
        <Group h="100%" px="xs" justify="space-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <UnstyledButton
                key={item.path}
                className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
                onClick={() => navigate(item.path)}
              >
                <Stack gap={4} align="center">
                  <Icon
                    size={24}
                    stroke={isActive ? 2.5 : 1.5}
                    className={classes.navIcon}
                  />
                  <Text size="xs" fw={isActive ? 600 : 400}>
                    {item.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            );
          })}
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
