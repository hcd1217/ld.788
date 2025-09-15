import { ActionIcon, Box, Button, Card, Group, type MantineStyleProp, Text } from '@mantine/core';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateRange } from '@/utils/timekeeper.utils';

interface TimesheetWeekNavigationProps {
  readonly weekRange: {
    readonly start: Date;
    readonly end: Date;
  };
  readonly isCurrentWeek: boolean;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
  readonly variant?: 'desktop' | 'mobile';
  readonly style?: MantineStyleProp;
  readonly className?: string;
}

export function TimesheetWeekNavigation({
  weekRange,
  isCurrentWeek,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  variant = 'desktop',
  style,
  className,
}: TimesheetWeekNavigationProps) {
  const { t } = useTranslation();
  const { isSmallMobile } = useDeviceType();

  if (variant === 'mobile') {
    return (
      <Group justify="space-between" wrap="nowrap" style={style} className={className}>
        <Group justify="center" gap="sm" wrap="nowrap" w="100%">
          <ActionIcon
            p={0}
            m={0}
            variant="subtle"
            size="lg"
            onClick={onPreviousWeek}
            c="var(--mantine-color-black)"
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <Button
            variant={isCurrentWeek ? 'filled' : 'light'}
            color="var(--mantine-color-white)"
            bg="var(--mantine-color-black)"
            size="sm"
            radius="xl"
            p={0}
            m={0}
            style={{ minWidth: 160 }}
          >
            {formatDateRange(weekRange.start, weekRange.end)}
          </Button>

          <ActionIcon
            p={0}
            m={0}
            variant="subtle"
            size="lg"
            c="var(--mantine-color-black)"
            onClick={onNextWeek}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>
        {isSmallMobile ? (
          <ActionIcon
            disabled={isCurrentWeek}
            mr="sm"
            variant="subtle"
            size="lg"
            c="var(--mantine-color-black)"
            onClick={onCurrentWeek}
          >
            <IconCalendar size={20} />
          </ActionIcon>
        ) : (
          <Button
            disabled={isCurrentWeek}
            variant="light"
            color="dark"
            mr="sm"
            w="100%"
            size="compact-sm"
            onClick={onCurrentWeek}
            leftSection={<IconCalendar size={16} />}
          >
            {t('timekeeper.thisWeek')}
          </Button>
        )}
      </Group>
    );
  }

  // Desktop variant
  return (
    <Group gap="md" style={style} className={className}>
      <ActionIcon variant="subtle" size="lg" onClick={onPreviousWeek}>
        <IconChevronLeft size={20} />
      </ActionIcon>

      <Card shadow="xs" radius="lg" px="xl" py="sm" bg={isCurrentWeek ? 'dark' : 'gray.1'}>
        <Text size="md" fw={600} c={isCurrentWeek ? 'white' : 'dark'}>
          {formatDateRange(weekRange.start, weekRange.end)}
        </Text>
      </Card>

      <ActionIcon variant="subtle" size="lg" onClick={onNextWeek}>
        <IconChevronRight size={20} />
      </ActionIcon>

      <Box style={{ marginLeft: 'auto' }}>
        <Button
          disabled={isCurrentWeek}
          variant="light"
          color="dark"
          onClick={onCurrentWeek}
          leftSection={<IconCalendar size={16} />}
        >
          {t('timekeeper.thisWeek')}
        </Button>
      </Box>
    </Group>
  );
}
