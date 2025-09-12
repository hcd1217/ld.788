import { memo, useCallback, useEffect, useState } from 'react';

import { useLocation, useNavigate } from 'react-router';

import { AppShell, Collapse, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCaretDownFilled } from '@tabler/icons-react';

import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useDesktopNavigation } from '@/hooks/useNavigationItems';
import { useTranslation } from '@/hooks/useTranslation';
import { isNavigationItemActive } from '@/utils/navigationUtils';

import classes from './AuthLayout.module.css';

import type { NavigationItem } from './types';
import type { TFunction } from 'i18next';

// Persist expanded menu state
const EXPANDED_MENU_KEY = 'auth-layout-expanded-menu';

function getPersistedExpandedMenuId(): string | undefined {
  try {
    const stored = localStorage.getItem(EXPANDED_MENU_KEY);
    return stored || undefined;
  } catch {
    return undefined;
  }
}

function setPersistedExpandedMenuId(id: string | undefined) {
  try {
    if (id) {
      localStorage.setItem(EXPANDED_MENU_KEY, id);
    } else {
      localStorage.removeItem(EXPANDED_MENU_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

// Memoized navigation item component to prevent unnecessary re-renders
const NavigationItemComponent = memo(
  ({
    item,
    isActive,
    isExpanded,
    pathname,
    onToggle,
    onNavigate,
  }: {
    readonly item: NavigationItem;
    readonly isActive: boolean;
    readonly isExpanded: boolean;
    readonly pathname: string;
    readonly onToggle: (id: string) => void;
    readonly onNavigate: (path: string) => void;
    readonly t: TFunction;
  }) => {
    const Icon = item.icon;

    const handleClick = () => {
      if (item.disabled) return;
      if (item.subs) {
        onToggle(item.id);
      } else if (item.path) {
        onNavigate(item.path);
      }
    };

    const buttonContent = (
      <UnstyledButton
        className={`${classes.navButton} ${isActive && !item.subs ? classes.active : ''}`}
        aria-current={isActive && !item.subs ? 'page' : undefined}
        aria-expanded={item.subs ? isExpanded : undefined}
        aria-controls={item.subs ? `submenu-${item.id}` : undefined}
        aria-disabled={item.disabled}
        onClick={handleClick}
        style={{
          opacity: item.disabled ? 0.5 : 1,
          cursor: item.disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Group className={classes.navGroup}>
          <Group>
            {isActive && !item.subs ? (
              <div className={classes.activeTag} aria-hidden="true" />
            ) : null}
            <Icon
              color="var(--menu-color)"
              size={LAYOUT_CONFIG.NAV_ICON_SIZE}
              className={classes.navIcon}
              aria-hidden="true"
            />
            <Text
              c={isActive ? 'var(--menu-active-color)' : 'var(--menu-color)'}
              className={classes.navLabel}
            >
              {item.label}
            </Text>
          </Group>
          {item.subs ? (
            <IconCaretDownFilled
              size={LAYOUT_CONFIG.CARET_ICON_SIZE}
              className={`${classes.chevron} ${isExpanded ? classes.expanded : ''}`}
              aria-hidden="true"
            />
          ) : null}
        </Group>
      </UnstyledButton>
    );

    if (item.subs) {
      return (
        <Stack className={classes.navItemsContainer}>
          {buttonContent}
          <Collapse in={isExpanded}>
            <Stack
              className={classes.navItemsContainer}
              id={`submenu-${item.id}`}
              role="group"
              aria-label={item.label}
            >
              {item.subs.map((subItem) => (
                <NavigationSubItem
                  key={subItem.id}
                  item={subItem}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </Stack>
          </Collapse>
        </Stack>
      );
    }

    return buttonContent;
  },
);

NavigationItemComponent.displayName = 'NavigationItemComponent';

// Memoized sub-navigation item
const NavigationSubItem = memo(
  ({
    item,
    pathname,
    onNavigate,
  }: {
    readonly item: NavigationItem;
    readonly pathname: string;
    readonly onNavigate: (path: string) => void;
  }) => {
    const isActive = isNavigationItemActive(item, pathname);

    return (
      <UnstyledButton
        className={`${classes.subNavButton} ${isActive ? classes.active : ''}`}
        aria-current={isActive ? 'page' : undefined}
        aria-disabled={item.disabled}
        onClick={() => {
          if (item.disabled) return;
          if (item.path) {
            onNavigate(item.path);
          }
        }}
        style={{
          opacity: item.disabled ? 0.5 : 1,
          cursor: item.disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <Group className={classes.subNavGroup}>
          {isActive ? <div className={classes.activeTag} aria-hidden="true" /> : null}
          <Text
            c={isActive ? 'var(--menu-active-color)' : 'var(--menu-color)'}
            className={classes.subNavLabel}
          >
            {item.label}
          </Text>
        </Group>
      </UnstyledButton>
    );
  },
);

NavigationSubItem.displayName = 'NavigationSubItem';

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Use shared hook for navigation items
  const { navigationItems } = useDesktopNavigation();

  const [expandedMenuId, setExpandedMenuId] = useState<string | undefined>(
    getPersistedExpandedMenuId(),
  );

  // Auto-expand menus that have active submenus
  useEffect(() => {
    const itemsWithActiveSubs = navigationItems.filter((item) =>
      item.subs?.some((sub) => isNavigationItemActive(sub, location.pathname)),
    );

    if (itemsWithActiveSubs.length > 0 && itemsWithActiveSubs[0]) {
      const newExpandedId = itemsWithActiveSubs[0].id;
      setExpandedMenuId(newExpandedId);
      setPersistedExpandedMenuId(newExpandedId);
    }
  }, [location.pathname, navigationItems]);

  const handleExpandedMenuChange = useCallback((id: string | undefined) => {
    setExpandedMenuId(id);
    setPersistedExpandedMenuId(id);
  }, []);

  const handleToggle = useCallback(
    (id: string) => {
      handleExpandedMenuChange(expandedMenuId === id ? undefined : id);
    },
    [expandedMenuId, handleExpandedMenuChange],
  );

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  return (
    <AppShell.Navbar
      p="0"
      bg="var(--menu-background-color)"
      c="var(--app-shell-color)"
      withBorder={false}
      w={LAYOUT_CONFIG.NAVBAR_ACTUAL_WIDTH}
      role="navigation"
      aria-label={t('common.mainNavigation')}
    >
      <Stack className={classes.navbarStack}>
        {navigationItems.map((item) => {
          const isActive = isNavigationItemActive(item, location.pathname);
          const isExpanded = item.id === expandedMenuId;

          return (
            <NavigationItemComponent
              key={item.id}
              item={item}
              isActive={isActive}
              isExpanded={isExpanded}
              pathname={location.pathname}
              t={t}
              onToggle={handleToggle}
              onNavigate={handleNavigate}
            />
          );
        })}
      </Stack>
    </AppShell.Navbar>
  );
}
