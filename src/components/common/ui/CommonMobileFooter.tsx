import { useNavigate, useLocation } from 'react-router';
import { useMemo } from 'react';
import { BaseMobileFooter, type BaseMobileFooterItem } from './BaseMobileFooter';
import { useMobileNavigation } from '@/hooks/useNavigationItems';

export function CommonMobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  // Use shared hook for navigation items
  const { navigationItems: items } = useMobileNavigation();

  // Transform navigation items to BaseMobileFooterItem format
  const navigationItems = useMemo(() => {
    return items.map(
      (item) =>
        ({
          id: item.id,
          icon: item.icon,
          label: item.label,
          path: item.path,
          disabled: item.disabled,
        }) as BaseMobileFooterItem,
    );
  }, [items]);

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
