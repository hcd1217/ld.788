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
  Collapse,
} from '@mantine/core';
import {Outlet, useNavigate, useLocation} from 'react-router';
import {useDisclosure} from '@mantine/hooks';
import {
  IconAddressBook,
  IconBuildingStore,
  IconCash,
  IconCaretDownFilled,
  IconCircle,
  IconLayoutDashboard,
  IconLock,
  IconLogout,
  IconSettings,
  IconShield,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconUsersGroup,
  IconSettingsFilled,
} from '@tabler/icons-react';
import type {TFunction} from 'i18next';
import {useMemo, useState, useEffect} from 'react';
import classes from './AuthLayout.module.css';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';
import {
  PWAInstallPrompt,
  ColorSchemeToggle,
  LanguageSwitcher,
  VersionInformation,
  AppLogo,
} from '@/components/common';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';
import type {User} from '@/services/auth';
import {useIsDesktop} from '@/hooks/useIsDesktop';

const activeTag = <div className={classes.activeTag} />;

export function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user} = useAppStore();
  const {t} = useTranslation();
  const [desktopOpened, {toggle: toggleDesktop}] = useDisclosure(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const isDarkMode = useIsDarkMode();
  const isDesktop = useIsDesktop();

  const navigationItems = useMemo(() => {
    return buildNavigationItems(t, user);
  }, [t, user]);

  // Auto-expand menus that have active submenus
  useEffect(() => {
    const itemsWithActiveSubs = navigationItems.filter((item) =>
      item.subs?.some(
        (sub) =>
          location.pathname === sub.path ||
          sub.activePaths?.some((path) => location.pathname.startsWith(path)),
      ),
    );

    if (itemsWithActiveSubs.length > 0) {
      setExpandedMenus(itemsWithActiveSubs.map((item) => item.path));
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isDesktop) {
    return null;
  }

  return (
    <AppShell
      header={{height: 60}}
      navbar={{
        width: desktopOpened ? 300 : 0,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Header
        bg="var(--app-shell-background-color)"
        withBorder={false}
      >
        <Group h="100%" px="sm" justify="space-between">
          <Group>
            <AppLogo c="var(--app-shell-color)" fw={400} />
            <Burger
              // Opened={desktopOpened}
              visibleFrom="sm"
              size="xs"
              color="var(--app-shell-color)"
              onClick={toggleDesktop}
            />
          </Group>
          <Group>
            <Group visibleFrom="sm">
              <LanguageSwitcher />
              <ColorSchemeToggle />
            </Group>
            <UserMenu c="var(--app-shell-color)" />
          </Group>
        </Group>
      </AppShell.Header>
      {desktopOpened ? (
        <AppShell.Navbar
          p="0"
          bg="var(--menu-background-color)"
          c="var(--app-shell-color)"
          withBorder={false}
          w="250px"
        >
          <Stack className={classes.navbarStack}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                item.activePaths?.some((path) =>
                  location.pathname.startsWith(path),
                ) ||
                item.subs?.some(
                  (sub) =>
                    location.pathname === sub.path ||
                    sub.activePaths?.some((path) =>
                      location.pathname.startsWith(path),
                    ),
                );
              const isDummy = item.dummy ?? false;

              const isExpanded = expandedMenus.includes(item.path);

              const handleParentClick = () => {
                if (item.subs) {
                  setExpandedMenus((prev) =>
                    prev.includes(item.path)
                      ? prev.filter((p) => p !== item.path)
                      : [...prev, item.path],
                  );
                } else {
                  navigate(item.path);
                }
              };

              const buttonContent = (
                <UnstyledButton
                  key={item.path}
                  className={`${classes.navButton} ${desktopOpened ? classes.navButtonOpen : classes.navButtonClosed} ${isActive && !item.subs ? classes.navButtonActive : classes.navButtonInactive}`}
                  onClick={handleParentClick}
                >
                  <Group
                    className={`${classes.navGroup} ${desktopOpened ? classes.navGroupSpaceBetween : classes.navGroupCentered}`}
                  >
                    <Group>
                      {isActive && !item.subs && desktopOpened
                        ? activeTag
                        : null}
                      <Icon
                        color="var(--menu-color)"
                        size={20}
                        className={classes.navIcon}
                      />
                      {desktopOpened ? (
                        <Text
                          c={
                            isActive
                              ? 'var(--menu-active-color)'
                              : 'var(--menu-color)'
                          }
                          className={classes.navLabel}
                        >
                          {item.label}
                        </Text>
                      ) : null}
                      {isDummy ? (
                        <IconCircle
                          className={classes.dummyIndicator}
                          color="red"
                          fill="red"
                          size={10}
                        />
                      ) : null}
                    </Group>
                    {desktopOpened && item.subs ? (
                      <IconCaretDownFilled
                        size={16}
                        style={{
                          marginRight: 'var(--mantine-spacing-lg)',
                        }}
                        className={`${classes.chevron} ${isExpanded ? classes.chevronExpanded : classes.chevronCollapsed}`}
                      />
                    ) : null}
                  </Group>
                </UnstyledButton>
              );

              const menuItem = desktopOpened ? (
                buttonContent
              ) : (
                <Tooltip
                  key={item.path}
                  withArrow
                  label={item.label}
                  position="right"
                  c={isDarkMode ? 'var(--app-shell-color)' : undefined}
                  bg={isDarkMode ? 'brand.8' : 'brand.4'}
                  openDelay={300}
                >
                  {buttonContent}
                </Tooltip>
              );

              // If the item has submenus, render them
              if (item.subs && desktopOpened) {
                return (
                  <Stack key={item.path} className={classes.navItemsContainer}>
                    {menuItem}
                    <Collapse in={isExpanded}>
                      <Stack className={classes.navItemsContainer}>
                        {item.subs.map((subItem) => {
                          const isSubActive =
                            location.pathname === subItem.path ||
                            subItem.activePaths?.some((path) =>
                              location.pathname.startsWith(path),
                            );

                          return (
                            <UnstyledButton
                              key={subItem.path}
                              className={`${classes.subNavButton} ${isSubActive ? classes.subNavButtonActive : classes.subNavButtonInactive}`}
                              onClick={() => navigate(subItem.path)}
                            >
                              <Group className={classes.subNavGroup}>
                                {isSubActive ? activeTag : null}
                                <Text
                                  c={
                                    isSubActive
                                      ? 'var(--menu-active-color)'
                                      : 'var(--menu-color)'
                                  }
                                  className={classes.subNavLabel}
                                >
                                  {subItem.label}
                                </Text>
                              </Group>
                            </UnstyledButton>
                          );
                        })}
                      </Stack>
                    </Collapse>
                  </Stack>
                );
              }

              return menuItem;
            })}

            <Divider my="sm" hiddenFrom="sm" />

            <Stack className={classes.mobileControls} hiddenFrom="sm">
              <LanguageSwitcher />
              <ColorSchemeToggle />
            </Stack>
          </Stack>
        </AppShell.Navbar>
      ) : null}

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <PWAInstallPrompt />
    </AppShell>
  );
}

interface NavigationItem {
  label: string;
  icon: React.ElementType;
  path: string;
  dummy?: boolean;
  activePaths?: string[];
  hidden?: boolean;
  subs?: NavigationItem[];
}

function buildNavigationItems(t: TFunction, user?: User): NavigationItem[] {
  console.log('buildNavigationItems...');
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
      icon: IconLayoutDashboard,
      path: '/home',
    },
    {
      label: t('common.storeManagement'),
      icon: IconBuildingStore,
      path: '/stores',
      hidden: true,
      activePaths: ['/stores', '/store-config'],
    },
    {
      label: t('common.employeeManagement'),
      icon: IconAddressBook,
      path: '/employee-management',
      activePaths: [
        '/employee-management',
        '/employees/add',
        '/employees/edit',
      ],
    },
    {
      label: t('common.configuration'),
      icon: IconSettingsFilled,
      path: '/configuration',
      subs: [
        {
          label: t('common.storeManagement'),
          icon: IconBuildingStore,
          path: '/store-management',
        },
        {
          label: t('common.salaryManagement'),
          icon: IconCash,
          path: '/salary-management',
        },
      ],
    },
    {
      label: t('common.staffManagement'),
      icon: IconUsersGroup,
      path: '/staff',
      dummy: true,
      hidden: true,
      activePaths: ['/staff', '/staff/add'],
    },
    {
      label: t('common.userManagement'),
      icon: IconUsers,
      path: '/user-management',
      hidden: true,
      // Hidden: !isRoot,
    },
    ...(isAdminRoutesEnabled ? adminItems : []),
    {
      label: t('common.profile'),
      icon: IconUserCircle,
      path: '/profile',
    },
  ].filter((item) => ('hidden' in item ? !item.hidden : true));
}

function UserMenu({c}: {readonly c?: string}) {
  const navigate = useNavigate();
  const {user, logout} = useAppStore();
  const {t} = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user ? `${user.email.charAt(0).toUpperCase()}` : 'U';

  return (
    <Menu
      shadow="md"
      width={200}
      position="bottom-end"
      transitionProps={{transition: 'pop-top-right'}}
    >
      <Menu.Target>
        <UnstyledButton className={classes.userMenuButton}>
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
          leftSection={<IconLogout style={{width: rem(14), height: rem(14)}} />}
          onClick={handleLogout}
        >
          {t('common.logout')}
        </Menu.Item>
        <VersionInformation />
      </Menu.Dropdown>
    </Menu>
  );
}
