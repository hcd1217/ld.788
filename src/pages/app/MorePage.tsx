import { useCallback, useMemo } from 'react';

import { Navigate, useNavigate } from 'react-router';

import { Box, Button, Card, Divider, Group, rem, Stack, Text } from '@mantine/core';
import {
  IconBell,
  IconBuildingWarehouse,
  IconClock,
  IconExternalLink,
  IconLogout,
  IconPackage,
  IconShoppingCart,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';

import { AppMobileLayout } from '@/components/common';
import { ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';
import { isDevelopment } from '@/utils/env';

export function MorePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAppStore();
  const { isDesktop } = useDeviceType();

  const handleLogout = useCallback(() => {
    logout();
    navigate(ROUTERS.ROOT);
  }, [logout, navigate]);

  const menuItems = useMemo(() => {
    return [
      {
        title: t('common.pages.timeKeeper'),
        description: t('common.pages.timeKeeperDescription'),
        icon: IconClock,
        onClick: () => navigate(ROUTERS.TIME_KEEPER_DASHBOARD),
        color: 'green',
        hidden: !isDevelopment,
      },
      {
        title: t('common.pages.employeeManagement'),
        description: t('common.pages.employeeManagementDescription'),
        icon: IconUsersGroup,
        onClick: () => navigate(ROUTERS.EMPLOYEE_MANAGEMENT),
        color: 'cyan',
      },
      {
        title: t('common.pages.productConfig'),
        description: t('common.pages.productConfigDescription'),
        icon: IconPackage,
        onClick: () => navigate(ROUTERS.PRODUCT_CONFIG),
        color: 'pink',
      },
      {
        title: t('common.pages.customerConfig'),
        description: t('common.pages.customerConfigDescription'),
        icon: IconBuildingWarehouse,
        onClick: () => navigate(ROUTERS.CUSTOMER_CONFIG),
        color: 'lime',
      },
      {
        title: t('common.pages.vendorConfig'),
        description: t('common.pages.vendorConfigDescription'),
        icon: IconShoppingCart,
        onClick: () => navigate(ROUTERS.VENDOR_CONFIG),
        color: 'lime',
      },
      {
        title: t('common.pages.notifications'),
        description: t('common.pages.notificationsDescription'),
        icon: IconBell,
        onClick: () => navigate(ROUTERS.NOTIFICATIONS),
        color: 'orange',
      },
      {
        title: t('common.pages.profile'),
        description: t('common.pages.profileDescription'),
        icon: IconUser,
        onClick: () => navigate(ROUTERS.PROFILE),
        color: 'grape',
      },
    ].filter((item) => !item.hidden);
  }, [t, navigate]);

  if (!user) {
    return <Navigate to={ROUTERS.LOGIN} />;
  }

  if (isDesktop) {
    return <Navigate to={ROUTERS.HOME} />;
  }

  return (
    <AppMobileLayout noHeader>
      <Box style={{ maxWidth: '600px', width: '100%' }}>
        <Card shadow="sm" padding="lg" radius="md">
          <Stack gap="md">
            <div>
              <Text fw={600} mb="sm">
                {t('common.navigation')}
              </Text>
              <Stack gap="xs">
                {menuItems.map((item) => (
                  <Card
                    key={item.title}
                    withBorder
                    p="md"
                    style={{ cursor: 'pointer' }}
                    onClick={item.onClick}
                  >
                    <Group
                      justify="space-between"
                      style={{
                        position: 'relative',
                      }}
                    >
                      <Group gap="sm">
                        <item.icon
                          size={20}
                          style={{
                            color: `var(--mantine-color-${item.color}-6)`,
                          }}
                        />
                        <div>
                          <Text fw={500}>{item.title}</Text>
                          <Text size="sm" c="dimmed">
                            {item.description}
                          </Text>
                        </div>
                      </Group>
                      <IconExternalLink
                        size={16}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: -3,
                          color: 'var(--mantine-color-gray-5)',
                        }}
                      />
                    </Group>
                  </Card>
                ))}
              </Stack>
            </div>

            <Divider />
            <Button fullWidth color="red" variant="light" onClick={handleLogout}>
              <IconLogout size={rem(16)} />
              <Text ml="xs">{t('common.logout')}</Text>
            </Button>
          </Stack>
        </Card>
      </Box>
    </AppMobileLayout>
  );
}
