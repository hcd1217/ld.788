import { Stack, Group, ActionIcon, Button, Grid, Box } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import type { TimesheetEntry } from '@/types/timekeeper';
import { MyTimesheetWeekSummary } from './MyTimesheetWeekSummary';
import { MyTimesheetDayCard } from './MyTimesheetDayCard';
import { getWeekRange, formatDateRange } from '@/utils/timekeeper.utils';

interface MyTimesheetMobileProps {
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

export function MyTimesheetMobile({
  currentWeek,
  weekDays,
  entriesByDate,
  weekTotals,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
}: MyTimesheetMobileProps) {
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
    <Box
      style={{
        height: '100%', // Use 100% since parent now has proper flexbox layout
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      px={0}
    >
      {/* Fixed header section */}
      <Box px={0} pt="lg" pb="md">
        {/* Header with navigation */}
        <Grid>
          {/* Week selector - Mobile optimized */}
          <Grid.Col span={{ base: 8 }} p={0}>
            <Group justify="center" gap="xs" wrap="nowrap">
              <ActionIcon
                p={0}
                m={0}
                variant="subtle"
                size="lg"
                onClick={onPreviousWeek}
                c="var(--mantine-color-black)"
                aria-label="Previous week"
              >
                <IconChevronLeft size={20} />
              </ActionIcon>

              <Button
                variant={isCurrentWeek ? 'filled' : 'light'}
                color="var(--mantine-color-white)"
                bg="var(--mantine-color-black)"
                size="sm"
                radius="xl"
                p={0}
                m={0}
                style={{ minWidth: 160 }}
              >
                {formatDateRange(weekRange.start, weekRange.end)}
              </Button>

              <ActionIcon
                p={0}
                m={0}
                variant="subtle"
                size="lg"
                c="var(--mantine-color-black)"
                onClick={onNextWeek}
                aria-label="Next week"
              >
                <IconChevronRight size={20} />
              </ActionIcon>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 4 }}>
            <Group justify="space-between" align="center">
              <Button
                disabled={isCurrentWeek}
                variant="light"
                color="dark"
                size="compact-sm"
                onClick={onCurrentWeek}
                leftSection={<IconCalendar size={16} />}
              >
                {t('timekeeper.thisWeek')}
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
        {/* Week Summary */}
        <Box mt="lg">
          <MyTimesheetWeekSummary
            regularHours={weekTotals.totalWorked}
            overtimeHours={weekTotals.totalOvertime}
          />
        </Box>
      </Box>

      {/* Scrollable daily entries */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingLeft: 'var(--mantine-spacing-md)',
          paddingRight: 'var(--mantine-spacing-md)',
          paddingBottom: 'var(--mantine-spacing-lg)',
        }}
      >
        <Stack gap="lg">
          {weekDays.map((day) => {
            const entry = entriesByDate.get(day.toDateString());
            return <MyTimesheetDayCard key={day.toISOString()} date={day} entry={entry} />;
          })}
        </Stack>
      </Box>
    </Box>
  );
}
