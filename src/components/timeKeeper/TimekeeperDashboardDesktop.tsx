import { Grid, Container, Paper, Stack, Title, Group, Badge, Text } from '@mantine/core';
import {
  IconCalendarEvent,
  IconClipboardList,
  IconBook,
  IconFileText,
  IconUsers,
  IconHeadset,
} from '@tabler/icons-react';
import { DashboardHeaderDesktop } from './DashboardHeaderDesktop';
import { DashboardTimesheet } from './DashboardTimesheet';
import { useTranslation } from '@/hooks/useTranslation';
import type { Shift, LeaveRequest } from '@/types/timekeeper';
import classes from './TimekeeperDashboardDesktop.module.css';

interface TimekeeperDashboardDesktopProps {
  readonly headerData: {
    userName: string;
    clockInTime: string;
    minutesAgo: number;
    workedHours: string;
    weeklyHours: string;
    remainingHours: string;
  };
  readonly upcomingShifts: Shift[];
  readonly pendingRequests: LeaveRequest[];
}

export function TimekeeperDashboardDesktop({
  headerData,
  upcomingShifts,
  pendingRequests,
}: TimekeeperDashboardDesktopProps) {
  const { t } = useTranslation();

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
      color: 'green',
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

  return (
    <Container fluid px="xl" py="md" className={classes.container}>
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

              {/* Quick Actions Grid */}
              <Grid gutter="md">
                {/* Upcoming Shifts */}
                <Grid.Col span={6}>
                  <Paper shadow="sm" radius="md" p="lg" className={classes.actionCard}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconCalendarEvent size={20} color="var(--mantine-color-blue-6)" />
                        <Title order={5}>{t('timekeeper.upcomingShifts')}</Title>
                      </Group>
                      <Badge variant="light" color="blue">
                        {upcomingShifts.length}
                      </Badge>
                    </Group>
                    <Stack gap="xs">
                      {upcomingShifts.slice(0, 3).map((shift) => (
                        <Paper key={shift.id} p="xs" radius="sm" withBorder>
                          <Group justify="space-between">
                            <Stack gap={2}>
                              <Text size="sm" fw={500}>
                                {new Date(shift.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {shift.startTime} - {shift.endTime}
                              </Text>
                            </Stack>
                            <Badge variant="light" color="gray" size="sm">
                              {shift.status}
                            </Badge>
                          </Group>
                        </Paper>
                      ))}
                      {upcomingShifts.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                          {t('timekeeper.noUpcomingShifts')}
                        </Text>
                      )}
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* Pending Requests */}
                <Grid.Col span={6}>
                  <Paper shadow="sm" radius="md" p="lg" className={classes.actionCard}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconClipboardList size={20} color="var(--mantine-color-orange-6)" />
                        <Title order={5}>{t('timekeeper.pendingRequests')}</Title>
                      </Group>
                      <Badge variant="light" color="orange">
                        {pendingRequests.length}
                      </Badge>
                    </Group>
                    <Stack gap="xs">
                      {pendingRequests.slice(0, 3).map((request) => (
                        <Paper key={request.id} p="xs" radius="sm" withBorder>
                          <Group justify="space-between">
                            <Stack gap={2}>
                              <Text size="sm" fw={500}>
                                {request.leaveType}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {new Date(request.startDate).toLocaleDateString()} -{' '}
                                {new Date(request.endDate).toLocaleDateString()}
                              </Text>
                            </Stack>
                            <Badge variant="light" color="yellow" size="sm">
                              {request.status}
                            </Badge>
                          </Group>
                        </Paper>
                      ))}
                      {pendingRequests.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center" py="md">
                          {t('timekeeper.noPendingRequests')}
                        </Text>
                      )}
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>
            </Stack>
          </Grid.Col>

          {/* Right Column - Resources */}
          <Grid.Col span={4}>
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
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
