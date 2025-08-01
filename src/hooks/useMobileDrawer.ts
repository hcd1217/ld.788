import {useDisclosure} from '@mantine/hooks';
import {useCallback, useState} from 'react';

export function useMobileDrawer() {
  const [
    filterDrawerOpened,
    {open: openFilterDrawer, close: closeFilterDrawer},
  ] = useDisclosure(false);

  const [drawerExpanded, setDrawerExpanded] = useState(false);

  // Reset drawer state when closed
  const handleDrawerClose = useCallback(() => {
    closeFilterDrawer();
    setDrawerExpanded(false);
  }, [closeFilterDrawer]);

  return {
    filterDrawerOpened,
    drawerExpanded,
    openFilterDrawer,
    setDrawerExpanded,
    handleDrawerClose,
  };
}
