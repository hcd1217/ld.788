import { useNavigate, useLocation } from 'react-router';
import { IconHome, IconClock, IconBriefcase, IconMenu2 } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo } from 'react';
import { BaseMobileFooter, type BaseMobileFooterItem } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';

export function TimekeeperMobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navigationItems = useMemo<BaseMobileFooterItem[]>(
    () => [
      {
        id: 'home',
        icon: IconHome,
        label: t('timekeeper.nav.home'),
        path: ROUTERS.TIME_KEEPER_DASHBOARD,
      },
      {
        id: 'clock',
        icon: IconClock,
        label: t('timekeeper.nav.clock'),
        path: ROUTERS.TIME_KEEPER_CLOCK,
      },
      {
        id: 'jobs',
        icon: IconBriefcase,
        label: t('timekeeper.nav.jobs'),
        path: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update when jobs page is available
      },
      {
        id: 'services',
        icon: IconMenu2,
        label: t('timekeeper.nav.services'),
        path: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update when services page is available
      },
    ],
    [t],
  );

  // Determine active item based on current path
  const activeItemId = useMemo(() => {
    const activeItem = navigationItems.find((item) => item.path === location.pathname);
    // Default to 'home' if on timekeeper dashboard
    return (
      activeItem?.id || (location.pathname === ROUTERS.TIME_KEEPER_DASHBOARD ? 'home' : undefined)
    );
  }, [navigationItems, location.pathname]);

  const handleItemClick = (item: BaseMobileFooterItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <BaseMobileFooter
      noActiveBg
      items={navigationItems}
      activeItemId={activeItemId}
      onItemClick={handleItemClick}
      iconSize={22}
    />
  );
}
