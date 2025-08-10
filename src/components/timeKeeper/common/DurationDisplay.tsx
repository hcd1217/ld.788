import { Text, Group, Badge } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDuration } from '@/utils/timekeeper.utils';

interface DurationDisplayProps {
  readonly minutes: number;
  readonly label?: string;
  readonly variant?: 'regular' | 'overtime' | 'break' | 'total';
  readonly showBadge?: boolean;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly inline?: boolean;
}

export function DurationDisplay({
  minutes,
  label,
  variant = 'regular',
  showBadge = false,
  size = 'sm',
  inline = false,
}: DurationDisplayProps) {
  const { t } = useTranslation();

  const variantConfig = {
    regular: { color: 'dimmed', badgeColor: 'gray' },
    overtime: { color: 'brand', badgeColor: 'brand' },
    break: { color: 'dimmed', badgeColor: 'blue' },
    total: { color: 'dark', badgeColor: 'dark' },
  };

  const config = variantConfig[variant];
  const formattedDuration = formatDuration(minutes);

  if (showBadge && minutes > 0 && variant === 'overtime') {
    return (
      <Badge size={size} variant="light" color={config.badgeColor}>
        +{formattedDuration} {label || t('timekeeper.overtime')}
      </Badge>
    );
  }

  if (inline) {
    return (
      <Text size={size} c={config.color}>
        {label && `${label}: `}
        <Text component="span" fw={600}>
          {formattedDuration}
        </Text>
      </Text>
    );
  }

  return (
    <Group gap="xs">
      {label && (
        <Text size={size} c={config.color}>
          {label}:
        </Text>
      )}
      <Text size={size} fw={600} c={config.color === 'dimmed' ? undefined : config.color}>
        {formattedDuration}
      </Text>
    </Group>
  );
}
