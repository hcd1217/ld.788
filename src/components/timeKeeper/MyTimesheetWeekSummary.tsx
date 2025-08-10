import { Card, Group, Text, Badge, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import classes from './MyTimesheetWeekSummary.module.css';

interface MyTimesheetWeekSummaryProps {
  readonly totalWorked: number;
  readonly totalBreak: number;
  readonly totalOvertime: number;
  readonly daysWorked: number;
}

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export function MyTimesheetWeekSummary({
  totalWorked,
  totalBreak,
  totalOvertime,
  daysWorked,
}: MyTimesheetWeekSummaryProps) {
  const { t } = useTranslation();

  return (
    <Card shadow="xs" padding="md" radius="md" className={classes.summaryCard}>
      <Group justify="space-between" mb="xs">
        <Text size="sm" fw={600} c="dimmed">
          {t('timekeeper.weekSummary')}
        </Text>
        <Badge variant="light" size="sm">
          {daysWorked} {t('timekeeper.daysWorked')}
        </Badge>
      </Group>
      <Group gap="xl">
        <Box>
          <Text size="xs" c="dimmed">
            {t('timekeeper.totalWorked')}
          </Text>
          <Text size="lg" fw={700} c="brand">
            {formatDuration(totalWorked)}
          </Text>
        </Box>
        {totalBreak > 0 && (
          <Box>
            <Text size="xs" c="dimmed">
              {t('timekeeper.totalBreak')}
            </Text>
            <Text size="lg" fw={700}>
              {formatDuration(totalBreak)}
            </Text>
          </Box>
        )}
        {totalOvertime > 0 && (
          <Box>
            <Text size="xs" c="dimmed">
              {t('timekeeper.overtime')}
            </Text>
            <Text size="lg" fw={700} c="brand">
              +{formatDuration(totalOvertime)}
            </Text>
          </Box>
        )}
      </Group>
    </Card>
  );
}
