import { Badge } from '@mantine/core';

interface StatusBadgeProps {
  readonly value?: string | number;
  readonly variant?: 'filled' | 'light' | 'dot' | 'outline';
  readonly color?: string;
  readonly label?: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly circle?: boolean;
}

export function StatusBadge({
  value,
  variant = 'light',
  color = 'gray',
  label,
  size = 'sm',
  circle = false,
}: StatusBadgeProps) {
  const displayValue = label || value;

  if (!displayValue) {
    return null;
  }

  return (
    <Badge size={size} variant={variant} color={color} circle={circle && variant === 'filled'}>
      {displayValue}
    </Badge>
  );
}
