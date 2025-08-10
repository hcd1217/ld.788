import type { ElementType } from 'react';
import { useMemo } from 'react';
import { SimpleGrid, Card, Group, Text, Badge, Box } from '@mantine/core';
import { IconCalendarCheck, IconCalendarWeek, IconUser, IconBeach } from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTERS } from '@/config/routeConfig';
import classes from './DashboardQuickActions.module.css';

interface QuickActionBadge {
  readonly value: number;
  readonly variant: 'filled' | 'dot';
  readonly color: string;
}

interface QuickActionItem {
  readonly id: string;
  readonly icon: ElementType;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly route?: string;
  readonly badge?: QuickActionBadge;
}

interface DashboardQuickActionsProps {
  readonly upcomingShifts?: number;
  readonly pendingRequests?: number;
}

export function DashboardQuickActions({
  upcomingShifts = 0,
  pendingRequests = 0,
}: DashboardQuickActionsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const quickActions = useMemo<QuickActionItem[]>(
    () => [
      {
        id: 'shifts',
        icon: IconCalendarCheck,
        titleKey: 'timekeeper.myShifts.title',
        descriptionKey: 'timekeeper.myShifts.description',
        route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_SHIFTS when available
        badge:
          upcomingShifts > 0
            ? {
                value: upcomingShifts,
                variant: 'filled',
                color: 'red',
              }
            : undefined,
      },
      {
        id: 'schedule',
        icon: IconCalendarWeek,
        titleKey: 'timekeeper.myJobSchedule.title',
        descriptionKey: 'timekeeper.myJobSchedule.description',
        route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_SCHEDULE when available
      },
      {
        id: 'leave',
        icon: IconUser,
        titleKey: 'timekeeper.myLeave.title',
        descriptionKey: 'timekeeper.myLeave.description',
        route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_LEAVE when available
        badge:
          pendingRequests > 0
            ? {
                value: pendingRequests,
                variant: 'dot',
                color: 'orange',
              }
            : undefined,
      },
      {
        id: 'request',
        icon: IconBeach,
        titleKey: 'timekeeper.requestLeave.title',
        descriptionKey: 'timekeeper.requestLeave.description',
        route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_LEAVE_REQUEST when available
      },
    ],
    [upcomingShifts, pendingRequests],
  );

  const handleCardClick = (action: QuickActionItem) => {
    if (action.route) {
      navigate(action.route);
    }
  };

  return (
    <Box>
      <SimpleGrid cols={2} spacing="lg">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className={classes.actionCard}
              shadow="xs"
              radius="md"
              padding="md"
              onClick={() => handleCardClick(action)}
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <Icon
                  color="var(--mantine-color-gray-7)"
                  size={48}
                  aria-hidden="true"
                  stroke={1.5}
                />
                {action.badge && (
                  <Badge
                    size="sm"
                    variant={action.badge.variant}
                    color={action.badge.color}
                    circle={action.badge.variant === 'filled'}
                  >
                    {action.badge.value}
                  </Badge>
                )}
              </Group>
              <Text size="xs" fw={600} mb={4} mt={'.2rem'}>
                {t(action.titleKey as any)}
              </Text>
              <Text size="xs" c="dimmed">
                {t(action.descriptionKey as any)}
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
