import {
  AppShell,
  Group,
  Title,
  Menu,
  Avatar,
  Text,
  rem,
  UnstyledButton,
  Box,
  Burger,
  Stack,
  Divider,
  useMantineColorScheme,
} from '@mantine/core';
import {Outlet, useNavigate, useLocation, useParams} from 'react-router';
import {useDisclosure} from '@mantine/hooks';
import {
  IconUser,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconDashboard,
  IconUserCircle,
} from '@tabler/icons-react';
import {PWAInstallPrompt} from '@/components/common/PWAInstallPrompt';
import {ColorSchemeToggle} from '@/components/common/ColorSchemeToggle';
import {LanguageSwitcher} from '@/components/common/LanguageSwitcher';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import {VersionInformation} from '@/components/common/VersionInformation';

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, logout} = useAppStore();
  const {t} = useTranslation();
  const [mobileOpened, {toggle: toggleMobile}] = useDisclosure();
  const {colorScheme} = useMantineColorScheme();
  const {clientCode} = useParams();

  const handleLogout = () => {
    logout();
    if (clientCode) {
      navigate(`/${clientCode}/login`);
    } else {
      navigate('/login');
    }
  };

  const navigationItems = [
    {
      label: t('common.dashboard'),
      icon: IconDashboard,
      path: clientCode ? `/${clientCode}/dashboard` : '/dashboard',
    },
    {
      label: t('common.profile'),
      icon: IconUserCircle,
      path: clientCode ? `/${clientCode}/profile` : '/profile',
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

  return (
    <AppShell
      header={{height: 60}}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: {mobile: !mobileOpened},
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              hiddenFrom="sm"
              size="sm"
              onClick={toggleMobile}
            />
            <Group gap="xs">
              <Box
                component="img"
                src="/logo.svg"
                alt="Logo"
                style={{
                  width: 30,
                  height: 30,
                }}
              />
              <Title order={3}>Credo</Title>
            </Group>
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
            const isActive = location.pathname === item.path;

            return (
              <UnstyledButton
                key={item.path}
                style={(theme) => ({
                  display: 'block',
                  width: '100%',
                  padding: theme.spacing.xs,
                  borderRadius: theme.radius.sm,
                  color:
                    colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                  backgroundColor: isActive
                    ? colorScheme === 'dark'
                      ? theme.colors.dark[6]
                      : theme.colors.gray[1]
                    : 'transparent',

                  '&:hover': {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? theme.colors.dark[6]
                        : theme.colors.gray[0],
                  },
                })}
                onClick={() => navigate(item.path)}
              >
                <Group>
                  <Icon size={20} />
                  <Text size="sm">{item.label}</Text>
                </Group>
              </UnstyledButton>
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
