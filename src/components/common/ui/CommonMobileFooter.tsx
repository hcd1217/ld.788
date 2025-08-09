import { useNavigate, useLocation } from 'react-router';
import { useMemo } from 'react';
import { BaseMobileFooter, type BaseMobileFooterItem } from './BaseMobileFooter';
import { useTranslation } from '@/hooks/useTranslation';
import { getMobileNavigationItems } from '@/services/navigationService';
import { useAppStore } from '@/stores/useAppStore';

// Stable empty object reference to avoid infinite loops
const EMPTY_ROUTE_CONFIG = {};

export function CommonMobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Use selector to only subscribe to userProfile changes (includes routeConfig and mobileNavigation in clientConfig)
  const userProfile = useAppStore((state) => state.userProfile);
  const routeConfig = userProfile?.routeConfig || EMPTY_ROUTE_CONFIG;

  // Get mobile navigation items from backend or static fallback
  // Backend mobile navigation takes priority if available
  const navigationItems = useMemo(() => {
    const items = getMobileNavigationItems(
      userProfile?.clientConfig?.mobileNavigation,
      t,
      routeConfig,
    );
    return items.map(
      (item) =>
        ({
          id: item.id,
          icon: item.icon,
          label: item.label,
          path: item.path,
        }) as BaseMobileFooterItem,
    );
  }, [userProfile, t, routeConfig]);

  // Determine active item based on current path
  const activeItemId = useMemo(() => {
    const activeItem = navigationItems.find((item) => item.path === location.pathname);
    return activeItem?.id;
  }, [navigationItems, location.pathname]);

  const handleItemClick = (item: BaseMobileFooterItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <BaseMobileFooter
      items={navigationItems}
      activeItemId={activeItemId}
      onItemClick={handleItemClick}
    />
  );
}
