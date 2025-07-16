import {
  AppShell,
  Group,
  Menu,
  Avatar,
  Text,
  rem,
  UnstyledButton,
  Burger,
  Stack,
  Divider,
  Tooltip,
} from '@mantine/core';
import {Outlet, useNavigate, useLocation} from 'react-router';
import {useDisclosure} from '@mantine/hooks';
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconUserCircle,
  IconUsers,
  IconShield,
  IconLock,
  IconHome,
  IconBuildingStore,
  IconUsersGroup,
  IconCircle,
} from '@tabler/icons-react';
import type {TFunction} from 'i18next';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {PWAInstallPrompt} from '@/components/common/PWAInstallPrompt';
import {ColorSchemeToggle} from '@/components/common/ColorSchemeToggle';
import {LanguageSwitcher} from '@/components/common/LanguageSwitcher';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {VersionInformation} from '@/components/common/VersionInformation';
import {AppLogo} from '@/components/common/AppLogo';
import type {User} from '@/services/auth';
import {useIsDesktop} from '@/hooks/useIsDesktop';

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, logout} = useAppStore();
  const {t} = useTranslation();
  const [desktopOpened, {toggle: toggleDesktop}] = useDisclosure(true);
  const isDarkMode = useIsDarkMode();
  const isDesktop = useIsDesktop();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = buildNavigationItems(t, user);
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
            <Group gap={7}>
              <Avatar radius="xl" size="md" color="brand">
                {userInitials}
              </Avatar>
              <Text fw={500} size="sm" lh={1} mr={3}>
                {user?.email}
              </Text>
              <IconChevronDown
                style={{width: rem(12), height: rem(12)}}
                stroke={1.5}
              />
            </Group>
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

  if (!isDesktop) {
    return null;
  }

  return (
    <AppShell
      header={{height: 60}}
      navbar={{
        width: desktopOpened ? 300 : 80,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={desktopOpened}
              visibleFrom="sm"
              size="sm"
              onClick={toggleDesktop}
            />
            <AppLogo />
          </Group>

          <Group>
            <Group visibleFrom="sm">
              <LanguageSwitcher />
              <ColorSchemeToggle />
            </Group>
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.activePaths?.includes(location.pathname) ?? location.pathname === item.path;
            const isDummy = item.dummy ?? false;

            const buttonContent = (
              <UnstyledButton
                key={item.path}
                style={(theme) => ({
                  display: 'block',
                  width: '100%',
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.sm,
                  color: isDarkMode ? theme.colors.dark[0] : theme.black,
                  backgroundColor: isActive
                    ? isDarkMode
                      ? theme.colors.dark[6]
                      : theme.colors.gray[1]
                    : 'transparent',

                  '&:hover': {
                    backgroundColor: isDarkMode
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                  },
                })}
                onClick={() => navigate(item.path)}
              >
                <Group
                  justify={desktopOpened ? 'flex-start' : 'center'}
                  style={{position: 'relative'}}
                >
                  <Icon size={20} />
                  {desktopOpened ? <Text size="sm">{item.label}</Text> : null}
                  {isDummy ? (
                    <IconCircle
                      style={{position: 'absolute', left: 15, top: 15}}
                      color="red"
                      fill="red"
                      size={10}
                    />
                  ) : null}
                </Group>
              </UnstyledButton>
            );

            return desktopOpened ? (
              buttonContent
            ) : (
              <Tooltip
                key={item.path}
                withArrow
                label={item.label}
                position="right"
                c={isDarkMode ? 'white' : undefined}
                bg={isDarkMode ? 'brand.8' : 'brand.4'}
                openDelay={300}
              >
                {buttonContent}
              </Tooltip>
            );
          })}

          <Divider my="sm" hiddenFrom="sm" />

          <Stack gap="xs" hiddenFrom="sm">
            <LanguageSwitcher />
            <ColorSchemeToggle />
          </Stack>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <PWAInstallPrompt />
    </AppShell>
  );
}

function buildNavigationItems(t: TFunction, user?: User): Array<{
  label: string;
  icon: React.ElementType;
  path: string;
  dummy?: boolean;
  activePaths?: string[];
}> {
  const isRoot = user?.isRoot ?? false;
  const isAdminRoutesEnabled =
    isRoot && localStorage.getItem('displayAdminRoutes') === 'true';

  const adminItems = [
    {
      label: t('common.roleManagement'),
      icon: IconShield,
      path: '/role-management',
    },
    {
      label: t('permission.management'),
      icon: IconLock,
      path: '/permission-management',
    },
  ];

  return [
    {
      label: t('common.home'),
      icon: IconHome,
      path: '/home',
    },
    {
      label: t('common.storeManagement'),
      icon: IconBuildingStore,
      path: '/stores',
      dummy: true,
      activePaths: [
        '/stores',
        '/store-config',
      ],
    },
    {
      label: t('common.staffManagement'),
      icon: IconUsersGroup,
      path: '/staff',
      dummy: true,
    },
    {
      label: t('common.userManagement'),
      icon: IconUsers,
      path: '/user-management',
      hidden: !isRoot,
    },
    ...(isAdminRoutesEnabled ? adminItems : []),
    {
      label: t('common.profile'),
      icon: IconUserCircle,
      path: '/profile',
    },
  ].filter((item) => ('hidden' in item ? !item.hidden : true));
}
