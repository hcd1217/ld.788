import { Box, Text, Grid } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import classes from './MyTimesheetWeekSummary.module.css';
import { formatDuration } from '@/utils/timekeeper.utils';

interface MyTimesheetWeekSummaryProps {
  readonly regularHours: number;
  readonly overtimeHours: number;
}
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
              {t('timekeeper.summary.regular')}:
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
              {t('timekeeper.summary.overtime')}:
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
              {t('timekeeper.summary.total')}:
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
