import { Grid, Text, UnstyledButton, Stack } from '@mantine/core';
import { useNavigate } from 'react-router';
import { IconAddressBook, IconDots, IconHome, IconShoppingCart } from '@tabler/icons-react';
import classes from './CommonMobileFooter.module.css';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTERS } from '@/config/routeConfig';

export function CommonMobileFooter() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const navigationItems = [
    {
      label: t('common.home'),
      icon: IconHome,
      path: ROUTERS.HOME,
    },
    {
      label: t('common.employeeManagementMobile'),
      icon: IconAddressBook,
      path: ROUTERS.EMPLOYEE_MANAGEMENT,
    },
    {
      label: t('common.poManagementMobile'),
      icon: IconShoppingCart,
      path: ROUTERS.PO_MANAGEMENT,
    },
    {
      label: t('common.more'),
      icon: IconDots,
      path: ROUTERS.MORE,
    },
  ];

  // Limit to maximum 4 items
  const displayItems = navigationItems.slice(0, 4);

  return (
    <Grid px={0} gutter={0}>
      {displayItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <Grid.Col key={item.path} span={3}>
            <UnstyledButton
              className={`${classes.navItem} ${isActive ? classes.navItemActive : ''}`}
              onClick={() => navigate(item.path)}
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
