import { Box, Text, Stack } from '@mantine/core';
import classes from './DateBox.module.css';

interface DateBoxProps {
  readonly date: Date;
  readonly isHighlighted?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
}

export function DateBox({ date, isHighlighted = false, size = 'md' }: DateBoxProps) {
  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNumber = date.getDate();
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

  const sizeMap = {
    sm: { header: 'xs', day: 'base', weekday: 'xs' },
    md: { header: 'xs', day: 'base', weekday: 'xs' },
    lg: { header: 'sm', day: 'lg', weekday: 'sm' },
  };

  const sizes = sizeMap[size];

  return (
    <Box
      className={classes.dateBox}
      style={{
        borderLeft: isHighlighted ? '1px solid var(--mantine-color-brand-6)' : undefined,
        background: isHighlighted ? 'var(--mantine-color-brand-0)' : undefined,
      }}
    >
      <Box className={classes.dateHeader}>
        <Text size={sizes.header as any} fw={600} ta="center" c="white">
          {monthName}
        </Text>
      </Box>
      <Stack className={classes.dateBody} gap={0} align="center" justify="center">
        <Text size={sizes.day as any} fw={700} ta="center" lh={1}>
          {dayNumber}
        </Text>
        <Text size={sizes.weekday as any} ta="center">
          {dayName}
        </Text>
      </Stack>
    </Box>
  );
}
