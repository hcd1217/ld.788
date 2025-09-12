import { memo } from 'react';

import { Box, Center, Container, Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconHandStop } from '@tabler/icons-react';

import { useGreeting } from '@/hooks/useGreeting';
import { useTranslation } from '@/hooks/useTranslation';
import type { DashboardHeaderData } from '@/types/timekeeper';

import classes from './DashboardHeader.module.css';

type DashboardHeaderProps = DashboardHeaderData;

export const DashboardHeader = memo(function DashboardHeader({
  userName,
  clockInTime,
  minutesAgo,
  hoursAgo,
  workedHours,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const greeting = useGreeting();

  return (
    <Box className={classes.dashboardHeader} style={{ backgroundColor: theme.colors.brand[7] }}>
      <Container className={classes.headerContent}>
        <Flex gap="md" align="stretch" justify={'space-between'}>
          <Box w="60vw">
            <Stack gap="sm">
              <IconHandStop
                size={56}
                style={{ transform: 'scaleX(-1) rotate(45deg)' }}
                aria-hidden="true"
                stroke={1.5}
              />
              <Text c="white" size="md" fw={600} lh={1.3}>
                {greeting}, <br />
                {userName}
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
              <Stack gap="xs">
                <Text ta="center" size="xs" c="white" opacity={0.7} fw={500}>
                  {t('timekeeper.youHaveWorked')}
                </Text>
                <Text ta="center" size="xl" fw={700} c="white" lh={1}>
                  {workedHours}
                </Text>
                <Text ta="center" size="xs" c="white" opacity={0.7} fw={500}>
                  {t('timekeeper.today')}
                </Text>
              </Stack>
            </Center>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
});
