import { memo, useMemo } from 'react';

import { useNavigate } from 'react-router';

import { Box, SimpleGrid } from '@mantine/core';

import { QUICK_ACTIONS_CONFIG, type QuickActionConfig } from '@/config/timekeeper.config';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

import { ActionCard } from '../common';

interface QuickActionBadge {
  readonly value: number;
  readonly variant: 'filled' | 'dot';
  readonly color: string;
}

interface QuickActionItem extends QuickActionConfig {
  readonly badge?: QuickActionBadge;
}

interface DashboardQuickActionsProps {
  readonly upcomingShifts?: number;
  readonly pendingRequests?: number;
}

export const DashboardQuickActions = memo(function DashboardQuickActions({
  upcomingShifts = 0,
  pendingRequests = 0,
}: DashboardQuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Responsive icon size: 32px for small mobile (iPhone SE), 48px for normal
  const { isSmallMobile } = useDeviceType();
  const iconSize = isSmallMobile ? 32 : 48;
  const spacing = isSmallMobile ? 'sm' : 'lg';

  const quickActions = useMemo<QuickActionItem[]>(
    () =>
      QUICK_ACTIONS_CONFIG.map((config) => ({
        ...config,
        badge: (() => {
          if (config.id === 'shifts' && upcomingShifts > 0) {
            return {
              value: upcomingShifts,
              variant: 'filled' as const,
              color: 'red',
            };
          }
          if (config.id === 'leave' && pendingRequests > 0) {
            return {
              value: pendingRequests,
              variant: 'dot' as const,
              color: 'orange',
            };
          }
          return undefined;
        })(),
      })),
    [upcomingShifts, pendingRequests],
  );

  const handleCardClick = (action: QuickActionItem) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <Box>
      <SimpleGrid cols={2} spacing={spacing}>
        {quickActions.map((action) => (
          <ActionCard
            key={action.id}
            icon={action.icon}
            title={t(action.titleKey as any)}
            description={t(action.descriptionKey as any)}
            badge={action.badge}
            onClick={() => handleCardClick(action)}
            iconSize={iconSize}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
});
