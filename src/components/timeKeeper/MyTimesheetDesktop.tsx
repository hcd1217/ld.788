import {
  Container,
  Stack,
  Title,
  Box,
  Paper,
  Grid,
  Group,
  ActionIcon,
  Button,
  Badge,
  Text,
  Card,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconClock,
  IconCalendarStats,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { TimesheetEntry } from '@/types/timekeeper';
import { MyTimesheetWeekSummary } from './MyTimesheetWeekSummary';
import { MyTimesheetDayCard } from './MyTimesheetDayCard';
import { getWeekRange, formatDateRange, formatHoursMinutes } from '@/utils/timekeeper.utils';

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

  // Calculate week range
  const weekRange = useMemo(() => getWeekRange(currentWeek), [currentWeek]);

  // Check if current week
  const isCurrentWeek = useMemo(() => {
    const today = new Date();
    const todayStr = today.toDateString();
    return weekDays.some((day) => day.toDateString() === todayStr);
  }, [weekDays]);

  return (
    <Container fluid px="xl" py="lg">
      <Stack gap="xl">
        {/* Header Section */}
        <Box>
          <Grid align="center">
            <Grid.Col span={6}>
              <Title order={2}>{t('timekeeper.myTimesheet.title' as any)}</Title>
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
          <Grid align="center">
            <Grid.Col span={8}>
              <Group gap="md">
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={onPreviousWeek}
                  aria-label="Previous week"
                >
                  <IconChevronLeft size={20} />
                </ActionIcon>

                <Card
                  shadow="xs"
                  radius="lg"
                  px="xl"
                  py="sm"
                  bg={isCurrentWeek ? 'dark' : 'gray.1'}
                >
                  <Text size="md" fw={600} c={isCurrentWeek ? 'white' : 'dark'}>
                    {formatDateRange(weekRange.start, weekRange.end)}
                  </Text>
                </Card>

                <ActionIcon variant="subtle" size="lg" onClick={onNextWeek} aria-label="Next week">
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Group>
            </Grid.Col>
            <Grid.Col span={4}>
              <Group justify="flex-end">
                <Button
                  disabled={isCurrentWeek}
                  variant="light"
                  color="dark"
                  onClick={onCurrentWeek}
                  leftSection={<IconCalendar size={16} />}
                >
                  {t('timekeeper.thisWeek')}
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
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
            {t('timekeeper.myTimesheet.title' as any)}
          </Title>
          <Grid gutter="md">
            {weekDays.map((day) => {
              const entry = entriesByDate.get(day.toDateString());
              return (
                <Grid.Col key={day.toISOString()} span={6}>
                  <MyTimesheetDayCard date={day} entry={entry} />
                </Grid.Col>
              );
            })}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}
