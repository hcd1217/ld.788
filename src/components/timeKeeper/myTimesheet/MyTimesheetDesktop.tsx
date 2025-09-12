import { Badge, Box, Container, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconCalendarStats, IconClock } from '@tabler/icons-react';

import { useTimesheetWeekLogic } from '@/hooks/useTimesheetWeekLogic';
import { useTranslation } from '@/hooks/useTranslation';
import type { TimesheetEntry } from '@/types/timekeeper';
import { formatHoursMinutes } from '@/utils/timekeeper.utils';

import { MyTimesheetWeekSummary } from './MyTimesheetWeekSummary';
import { TimesheetDayCardsList } from './TimesheetDayCardsList';
import { TimesheetWeekNavigation } from './TimesheetWeekNavigation';

interface MyTimesheetDesktopProps {
  readonly currentWeek: Date;
  readonly weekDays: Date[];
  readonly entriesByDate: Map<string, TimesheetEntry>;
  readonly weekTotals: {
    totalWorked: number;
    totalBreak: number;
    totalOvertime: number;
    daysWorked: number;
  };
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
}

export function MyTimesheetDesktop({
  currentWeek,
  weekDays,
  entriesByDate,
  weekTotals,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: MyTimesheetDesktopProps) {
  const { t } = useTranslation();

  // Use shared hook for week logic
  const { weekRange, isCurrentWeek } = useTimesheetWeekLogic({
    currentWeek,
    weekDays,
  });

  return (
    <Container fluid px="xl" py="lg">
      <Stack gap="xl">
        {/* Header Section */}
        <Box>
          <Grid align="center">
            <Grid.Col span={6}>
              <Title order={2}>{t('timekeeper.myTimesheet.title')}</Title>
            </Grid.Col>
            <Grid.Col span={6}>
              <Group justify="flex-end">
                <Badge
                  size="lg"
                  variant="light"
                  color={weekTotals.daysWorked >= 5 ? 'green' : 'blue'}
                  leftSection={<IconCalendarStats size={16} />}
                >
                  {weekTotals.daysWorked} {t('timekeeper.daysWorked')}
                </Badge>
              </Group>
            </Grid.Col>
          </Grid>
        </Box>

        {/* Navigation Section */}
        <Paper shadow="sm" radius="md" p="lg">
          <TimesheetWeekNavigation
            weekRange={weekRange}
            isCurrentWeek={isCurrentWeek}
            onPreviousWeek={onPreviousWeek}
            onNextWeek={onNextWeek}
            onCurrentWeek={onCurrentWeek}
            variant="desktop"
          />
        </Paper>

        {/* Week Summary Stats */}
        <Grid gutter="md">
          <Grid.Col span={3}>
            <Paper shadow="sm" radius="md" p="lg">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {t('timekeeper.totalWorked')}
                  </Text>
                  <Text size="xl" fw={700}>
                    {formatHoursMinutes(weekTotals.totalWorked)}
                  </Text>
                </Stack>
                <IconClock size={32} color="var(--mantine-color-blue-6)" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper shadow="sm" radius="md" p="lg">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {t('timekeeper.overtime')}
                  </Text>
                  <Text size="xl" fw={700} c={weekTotals.totalOvertime > 0 ? 'orange' : undefined}>
                    {formatHoursMinutes(weekTotals.totalOvertime)}
                  </Text>
                </Stack>
                <IconClock size={32} color="var(--mantine-color-orange-6)" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <Paper shadow="sm" radius="md" p="lg">
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" fw={500}>
                    {t('timekeeper.breakTime')}
                  </Text>
                  <Text size="xl" fw={700}>
                    {formatHoursMinutes(weekTotals.totalBreak)}
                  </Text>
                </Stack>
                <IconClock size={32} color="var(--mantine-color-gray-6)" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={3}>
            <MyTimesheetWeekSummary
              regularHours={weekTotals.totalWorked}
              overtimeHours={weekTotals.totalOvertime}
            />
          </Grid.Col>
        </Grid>

        {/* Daily Entries Section */}
        <Box>
          <Title order={4} mb="md">
            {t('timekeeper.myTimesheet.title')}
          </Title>
          <TimesheetDayCardsList
            weekDays={weekDays}
            entriesByDate={entriesByDate}
            variant="desktop"
          />
        </Box>
      </Stack>
    </Container>
  );
}
