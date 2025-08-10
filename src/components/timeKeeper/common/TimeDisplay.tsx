import { Text, Group } from '@mantine/core';
import { formatTime } from '@/utils/timekeeper.utils';

interface TimeDisplayProps {
  readonly time: Date | undefined;
  readonly label?: string;
  readonly showSeconds?: boolean;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly fw?: number;
}

export function TimeDisplay({
  time,
  label,
  showSeconds = false,
  size = 'sm',
  fw = 600,
}: TimeDisplayProps) {
  const formattedTime =
    showSeconds && time
      ? new Date(time).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      : formatTime(time);

  if (label) {
    return (
      <Group gap="xs">
        <Text size={size} c="dimmed">
          {label}:
        </Text>
        <Text size={size} fw={fw}>
          {formattedTime}
        </Text>
      </Group>
    );
  }

  return (
    <Text size={size} fw={fw}>
      {formattedTime}
    </Text>
  );
}
