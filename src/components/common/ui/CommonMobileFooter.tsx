import { Grid, Text, UnstyledButton, Stack } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useMemo } from 'react';
import classes from './CommonMobileFooter.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { getMobileNavigationItems } from '@/services/navigationService';
import { useAppStore } from '@/stores/useAppStore';

// Stable empty object reference to avoid infinite loops
const EMPTY_ROUTE_CONFIG = {};

export function CommonMobileFooter() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Use selector to only subscribe to userProfile changes (includes routeConfig and mobileNavigation in clientConfig)
  const userProfile = useAppStore((state) => state.userProfile);
  const routeConfig = userProfile?.routeConfig || EMPTY_ROUTE_CONFIG;

  // Get mobile navigation items from backend or static fallback
  // Backend mobile navigation takes priority if available
  const navigationItems = useMemo(() => {
    return getMobileNavigationItems(userProfile?.clientConfig?.mobileNavigation, t, routeConfig);
  }, [userProfile, t, routeConfig]);

  // Limit to maximum 4 items for mobile UI
  const displayItems = navigationItems.slice(0, 4);

  return (
    <Grid px={0} gutter={0}>
      {displayItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Grid.Col key={item.id} span={3}>
            <UnstyledButton
              className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                }
              }}
              w="100%"
            >
              <Stack gap={4} align="center">
                <Icon size={24} stroke={isActive ? 2.5 : 1.5} className={classes.navIcon} />
                <Text size="xs" fw={isActive ? 600 : 400}>
                  {item.label}
                </Text>
              </Stack>
            </UnstyledButton>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
