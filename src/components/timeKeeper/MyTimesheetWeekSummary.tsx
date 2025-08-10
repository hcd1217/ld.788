import { Box, Text, Grid } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import classes from './MyTimesheetWeekSummary.module.css';

interface MyTimesheetWeekSummaryProps {
  readonly regularHours: number;
  readonly overtimeHours: number;
}

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export function MyTimesheetWeekSummary({
  regularHours,
  overtimeHours,
}: MyTimesheetWeekSummaryProps) {
  const { t } = useTranslation();
  const totalHours = useMemo(() => regularHours + overtimeHours, [regularHours, overtimeHours]);

  return (
    <Box className={classes.summaryBar}>
      <Grid gutter={0} align="stretch">
        {/* Regular Hours */}
        <Grid.Col span={4} className={classes.gridColumn}>
          <Box className={classes.summarySection}>
            <Text size="xs" className={classes.label}>
              {t('timekeeper.summary.regular' as any)}:
            </Text>
            <Text size="lg" fw={600} className={classes.value}>
              {formatDuration(regularHours)}
            </Text>
          </Box>
        </Grid.Col>

        {/* Overtime Hours */}
        <Grid.Col span={4} className={classes.gridColumn}>
          <Box className={classes.summarySection}>
            <Text size="xs" className={classes.label}>
              {t('timekeeper.summary.overtime' as any)}:
            </Text>
            <Text size="lg" fw={600} className={classes.value}>
              {formatDuration(overtimeHours)}
            </Text>
          </Box>
        </Grid.Col>

        {/* Total Hours */}
        <Grid.Col span={4} className={classes.gridColumn}>
          <Box className={classes.summarySection}>
            <Text size="xs" className={classes.label}>
              {t('timekeeper.summary.total' as any)}:
            </Text>
            <Text size="lg" fw={600} className={classes.value}>
              {formatDuration(totalHours)}
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
