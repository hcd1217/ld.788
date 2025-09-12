import { useNavigate } from 'react-router';

import { Badge, Box, Card, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconBook,
  IconCalendarEvent,
  IconClipboardList,
  IconClipboardText,
  IconFileText,
  IconHeadset,
  IconUsers,
} from '@tabler/icons-react';

import { QUICK_ACTIONS_CONFIG } from '@/config/timekeeper.config';
import { useTranslation } from '@/hooks/useTranslation';

import { DashboardHeaderDesktop } from '../dashboard/DashboardHeaderDesktop';
import { DashboardTimesheet } from '../dashboard/DashboardTimesheet';

import classes from './TimekeeperDashboardDesktop.module.css';

interface TimekeeperDashboardDesktopProps {
  readonly headerData: {
    userName: string;
    clockInTime: string;
    minutesAgo: number;
    hoursAgo: number;
    workedHours: string;
    weeklyHours: string;
    remainingHours: string;
  };
  readonly upcomingShifts: number;
  readonly pendingRequests: number;
}

export function TimekeeperDashboardDesktop({
  headerData,
  upcomingShifts,
  pendingRequests,
}: TimekeeperDashboardDesktopProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Quick actions with dynamic badge data
  const quickActions = QUICK_ACTIONS_CONFIG.map((config) => ({
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
  }));

  const resources = [
    {
      icon: IconBook,
      title: t('timekeeper.resources.handbook'),
      description: t('timekeeper.resources.handbookDesc'),
      color: 'blue',
    },
    {
      icon: IconFileText,
      title: t('timekeeper.resources.policies'),
      description: t('timekeeper.resources.policiesDesc'),
      color: 'brand',
    },
    {
      icon: IconUsers,
      title: t('timekeeper.resources.directory'),
      description: t('timekeeper.resources.directoryDesc'),
      color: 'orange',
    },
    {
      icon: IconHeadset,
      title: t('timekeeper.resources.support'),
      description: t('timekeeper.resources.supportDesc'),
      color: 'red',
    },
  ];

  const handleActionClick = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <Box px="xl" py="md" className={classes.container}>
      <Stack gap="lg">
        {/* Header */}
        <DashboardHeaderDesktop {...headerData} />

        {/* Main Content Grid */}
        <Grid gutter="lg">
          {/* Left Column - Timesheet and Quick Actions */}
          <Grid.Col span={8}>
            <Stack gap="lg">
              {/* Timesheet */}
              <Paper shadow="sm" radius="md" p="lg">
                <DashboardTimesheet />
              </Paper>

              {/* Quick Actions Section - Same as mobile */}
              <Box>
                <Title order={5} mb="md">
                  {t('timekeeper.quickLinks')}
                </Title>
                <Grid gutter="md">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Grid.Col key={action.id} span={6}>
                        <Card
                          shadow="xs"
                          radius="md"
                          padding="lg"
                          style={{ cursor: 'pointer', height: '100%' }}
                          onClick={() => handleActionClick(action.route)}
                        >
                          <Group justify="space-between" align="flex-start" mb="md">
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
                          <Text size="sm" fw={600} mb={4}>
                            {t(action.titleKey as any)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t(action.descriptionKey as any)}
                          </Text>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Box>

              {/* Upcoming Shifts and Pending Requests Summary */}
              <Grid gutter="md">
                {/* Upcoming Shifts */}
                <Grid.Col span={6}>
                  <Paper shadow="sm" radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconCalendarEvent size={20} color="var(--mantine-color-blue-6)" />
                        <Title order={5}>{t('timekeeper.upcomingShifts')}</Title>
                      </Group>
                      <Badge variant="light" color="blue">
                        {upcomingShifts}
                      </Badge>
                    </Group>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" ta="center" py="md">
                        {upcomingShifts === 0
                          ? t('timekeeper.noUpcomingShifts')
                          : `${upcomingShifts} ${t('timekeeper.upcomingShifts')}`}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Pending Requests */}
                <Grid.Col span={6}>
                  <Paper shadow="sm" radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconClipboardList size={20} color="var(--mantine-color-orange-6)" />
                        <Title order={5}>{t('timekeeper.pendingRequests')}</Title>
                      </Group>
                      <Badge variant="light" color="orange">
                        {pendingRequests}
                      </Badge>
                    </Group>
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed" ta="center" py="md">
                        {pendingRequests === 0
                          ? t('timekeeper.noPendingRequests')
                          : `${pendingRequests} ${t('timekeeper.pendingRequests')}`}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Grid.Col>

          {/* Right Column - Resources */}
          <Grid.Col span={4}>
            <Stack gap="lg">
              {/* Resources Section */}
              <Paper shadow="sm" radius="md" p="lg">
                <Title order={5} mb="md">
                  {t('timekeeper.quickLinks')}
                </Title>
                <Stack gap="sm">
                  {resources.map((resource) => {
                    const Icon = resource.icon;
                    return (
                      <Paper
                        key={resource.title}
                        p="sm"
                        radius="sm"
                        withBorder
                        className={classes.resourceCard}
                      >
                        <Group gap="sm">
                          <Icon size={24} color={`var(--mantine-color-${resource.color}-6)`} />
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Text size="sm" fw={500}>
                              {resource.title}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {resource.description}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              </Paper>

              {/* Documents Section - from mobile */}
              <Paper shadow="sm" radius="md" p="lg">
                <Title order={5} mb="md">
                  {t('timekeeper.resourcesTitle')}
                </Title>
                <Card shadow="xs" radius="md">
                  <Group gap="md" wrap="nowrap">
                    <IconClipboardText color="var(--mantine-color-gray-7)" size={46} stroke={1.5} />
                    <Box style={{ flex: 1 }}>
                      <Text size="sm" fw={600}>
                        {t('timekeeper.documents.title')}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        {t('timekeeper.documents.description')}
                      </Text>
                    </Box>
                  </Group>
                </Card>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}
