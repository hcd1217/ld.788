import { useEffect, useState } from 'react';
import { Text, Stack, Paper } from '@mantine/core';
import { formatDate } from '@/utils/time';
import { formatTime } from '@/utils/timekeeper.utils';

export function ClockDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Paper p="sm">
      <Stack align="center" gap="xs">
        <Text size="2rem" fw={700} c="brand.6" style={{ fontFamily: 'monospace' }}>
          {formatTime(currentTime, true)}
        </Text>
        <Text size="xl" c="dimmed">
          {formatDate(currentTime)}
        </Text>
      </Stack>
    </Paper>
  );
}
