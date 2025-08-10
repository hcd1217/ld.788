import { Grid, Box, Paper, Stack, Title, Group, Badge, Text, Card } from '@mantine/core';
import {
  IconCalendarEvent,
  IconClipboardList,
  IconBook,
  IconFileText,
  IconUsers,
  IconHeadset,
  IconCalendarCheck,
  IconCalendarWeek,
  IconBeach,
  IconUserMinus,
  IconClipboardText,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router';
import { DashboardHeaderDesktop } from './DashboardHeaderDesktop';
import { DashboardTimesheet } from './DashboardTimesheet';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTERS } from '@/config/routeConfig';
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

  // Quick actions configuration - same as mobile
  const quickActions = [
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
              variant: 'filled' as const,
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
      icon: IconUserMinus,
      titleKey: 'timekeeper.myLeave.title',
      descriptionKey: 'timekeeper.myLeave.description',
      route: ROUTERS.TIME_KEEPER_DASHBOARD, // TODO: Update to ROUTERS.TIME_KEEPER_LEAVE when available
      badge:
        pendingRequests > 0
          ? {
              value: pendingRequests,
              variant: 'dot' as const,
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
  ];

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
