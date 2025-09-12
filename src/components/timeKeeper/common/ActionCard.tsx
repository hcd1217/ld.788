import type { ElementType, MouseEvent, ReactNode } from 'react';

import { Box, Card, Group, Text } from '@mantine/core';

import classes from './ActionCard.module.css';
import { StatusBadge } from './StatusBadge';

interface ActionCardProps {
  readonly icon: ElementType;
  readonly title: string;
  readonly description?: string;
  readonly badge?: {
    readonly value: number;
    readonly variant?: 'filled' | 'dot' | 'light' | 'outline';
    readonly color?: string;
  };
  readonly onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  readonly iconSize?: number;
  readonly iconColor?: string;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  badge,
  onClick,
  iconSize = 48,
  iconColor = 'var(--mantine-color-gray-7)',
  children,
  className,
}: ActionCardProps) {
  return (
    <Card
      className={`${classes.actionCard} ${className || ''}`}
      shadow="xs"
      radius="md"
      padding="md"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <Group justify="space-between" align="flex-start" mb="xs">
        <Icon color={iconColor} size={iconSize} aria-hidden="true" stroke={1.5} />
        {badge && (
          <StatusBadge
            value={badge.value}
            variant={badge.variant}
            color={badge.color}
            circle={badge.variant === 'filled'}
          />
        )}
      </Group>
      <Box style={{ flexGrow: 1 }} />
      <Box>
        <Text size="xs" fw={600} mb={4}>
          {title}
        </Text>
        {description && (
          <Text size="xs" c="dimmed">
            {description}
          </Text>
        )}
        {children}
      </Box>
    </Card>
  );
}
