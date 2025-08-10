import { useMemo } from 'react';
import { Box, Container, Text, Flex, Center, Stack, useMantineTheme } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import classes from './DashboardHeader.module.css';
import { IconHandStop } from '@tabler/icons-react';

interface DashboardHeaderProps {
  readonly userName: string;
  readonly clockInTime: string;
  readonly minutesAgo: number;
  readonly hoursAgo: number;
  readonly workedHours: string;
  readonly weeklyHours: string;
  readonly remainingHours: string;
}

export function DashboardHeader({
  userName,
  clockInTime,
  minutesAgo,
  hoursAgo,
  workedHours,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('timekeeper.greeting.morning');
    if (hour < 17) return t('timekeeper.greeting.afternoon');
    return t('timekeeper.greeting.evening');
  }, [t]);

  return (
    <Box className={classes.dashboardHeader} style={{ backgroundColor: theme.colors.brand[7] }}>
      <Container className={classes.headerContent}>
        <Flex gap="md" align="stretch">
          <Box>
            <Stack gap="xl">
              <IconHandStop
                size={56}
                style={{ transform: 'scaleX(-1) rotate(45deg)' }}
                aria-hidden="true"
                stroke={1.5}
              />
              <Text c="white" size="md" fw={600} lh={1.3}>
                {greeting}, {userName}
              </Text>
              <Text size="xs" c="white" opacity={0.85}>
                {t('timekeeper.clockedInAt', { time: clockInTime })}
                <br /> ({t('timekeeper.clockedInHourAgo', { hours: hoursAgo })}{' '}
                {t('timekeeper.clockedInMinuteAgo', { minutes: minutesAgo })})
              </Text>
            </Stack>
          </Box>

          <Box className={classes.mobileTimeStatsBox}>
            <Center>
              <Stack>
                <Text ta="center" size="xs" c="white" opacity={0.7} fw={500}>
                  {t('timekeeper.todayHours')}
                </Text>
                <Text ta="center" size="xl" fw={700} c="white" lh={1}>
                  {workedHours}
                </Text>
              </Stack>
            </Center>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
