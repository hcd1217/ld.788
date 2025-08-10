import { Paper, Text, Group, Stack, Grid, Badge, useMantineTheme } from '@mantine/core';
import { IconHandStop, IconClock, IconCalendarWeek } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useGreeting } from '@/hooks/useGreeting';
import type { DashboardHeaderData } from '@/types/timekeeper';
import classes from './DashboardHeaderDesktop.module.css';

type DashboardHeaderDesktopProps = DashboardHeaderData;

export function DashboardHeaderDesktop({
  userName,
  clockInTime,
  minutesAgo,
  hoursAgo,
  workedHours,
  weeklyHours,
  remainingHours,
}: DashboardHeaderDesktopProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const greeting = useGreeting();

  return (
    <Paper
      className={classes.headerCard}
      shadow="sm"
      radius="md"
      p="xl"
      style={{
        background: `linear-gradient(135deg, ${theme.colors.brand[6]} 0%, ${theme.colors.brand[7]} 100%)`,
      }}
    >
      <Grid>
        <Grid.Col span={6}>
          <Group gap="xl" align="flex-start">
            <IconHandStop
              size={64}
              color="white"
              style={{ transform: 'scaleX(-1) rotate(45deg)' }}
              aria-hidden="true"
            />
            <Stack gap="xs">
              <Text c="white" size="xl" fw={700}>
                {greeting}, {userName}
              </Text>
              <Group gap="xs">
                <Badge variant="white" color="brand.7" leftSection={<IconClock size={14} />}>
                  {t('timekeeper.clockedInAt', { time: clockInTime })}
                </Badge>
                <Text size="sm" c="white" opacity={0.85}>
                  {t('timekeeper.clockedInHourAgo', { hours: hoursAgo })}{' '}
                  {t('timekeeper.clockedInMinuteAgo', { minutes: minutesAgo })}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Grid.Col>

        <Grid.Col span={6}>
          <Group justify="flex-end" gap="xl">
            <Paper className={classes.statBox} shadow="xs" radius="md" p="md">
              <Stack gap={4} align="center">
                <Text size="xs" c="dimmed" fw={500}>
                  {t('timekeeper.youHaveWorked')}
                </Text>
                <Text size="xl" fw={700} c="brand.7">
                  {workedHours}
                </Text>
                <Text size="xs" c="dimmed" fw={500}>
                  {t('timekeeper.today')}
                </Text>
              </Stack>
            </Paper>

            <Paper className={classes.statBox} shadow="xs" radius="md" p="md">
              <Stack gap={4} align="center">
                <Group gap={4}>
                  <IconCalendarWeek size={14} color={theme.colors.gray[6]} />
                  <Text size="xs" c="dimmed" fw={500}>
                    {t('timekeeper.weeklyHours')}
                  </Text>
                </Group>
                <Text size="xl" fw={700} c="blue.6">
                  {weeklyHours}h
                </Text>
                <Text size="xs" c="dimmed">
                  {t('timekeeper.remaining')}: {remainingHours}h
                </Text>
              </Stack>
            </Paper>
          </Group>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
