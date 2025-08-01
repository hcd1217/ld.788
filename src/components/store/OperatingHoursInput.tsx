import {
  Stack,
  Group,
  Text,
  Switch,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {TimeInput} from '@mantine/dates';
import {IconCopy} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';

export type DaySchedule =
  | {
      open: string;
      close: string;
    }
  | {closed: true};

type OperatingHours = Record<string, DaySchedule>;

type OperatingHoursInputProps = {
  readonly value: OperatingHours;
  readonly onChange: (operatingHours: OperatingHours) => void;
  readonly disabled?: boolean;
};

const daysOfWeekKeys = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

// Const timeOptions = Array.from({length: 24 * 4}, (_, i) => {
//   const hour = Math.floor(i / 4);
//   const minute = (i % 4) * 15;
//   const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
//   return time;
// });

export function OperatingHoursInput({
  value,
  onChange,
  disabled = false,
}: OperatingHoursInputProps) {
  const {t} = useTranslation();

  const handleDayToggle = (day: string) => {
    const currentDay = value[day] || {open: '09:00', close: '17:00'};
    const isClosed = 'closed' in currentDay && currentDay.closed;

    const updatedHours = {
      ...value,
      [day]: isClosed
        ? {open: '09:00', close: '17:00'}
        : {closed: true as const},
    };
    onChange(updatedHours as OperatingHours);
  };

  const handleTimeChange = (
    day: string,
    field: 'open' | 'close',
    time: string,
  ) => {
    const currentDay = value[day] || {open: '09:00', close: '17:00'};

    // If it's a closed day, we need to convert it to an open day first
    const daySchedule =
      'closed' in currentDay ? {open: '09:00', close: '17:00'} : currentDay;

    const updatedHours = {
      ...value,
      [day]: {
        ...daySchedule,
        [field]: time,
      },
    };
    onChange(updatedHours);
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceSchedule = value[sourceDay] || {open: '09:00', close: '17:00'};

    const updatedHours: OperatingHours = {};
    for (const dayKey of daysOfWeekKeys) {
      updatedHours[dayKey] = sourceSchedule;
    }

    onChange(updatedHours);
  };

  return (
    <Stack gap="xs">
      {daysOfWeekKeys.map((key) => {
        const daySchedule = value[key] || {open: '09:00', close: '17:00'};
        const isClosed = 'closed' in daySchedule && daySchedule.closed;

        return (
          <Paper key={key} withBorder p="xs">
            <Group justify="space-between" wrap="nowrap" p={0}>
              <Group gap="sm" style={{flex: 1}} p={0}>
                <Text w={100} fw={500}>
                  {t(`store.${key}` as const)}
                </Text>
                <Switch
                  checked={!isClosed}
                  disabled={disabled}
                  label={isClosed ? t('store.closed') : t('store.open')}
                  size="sm"
                  w="10rem"
                  onChange={() => {
                    handleDayToggle(key);
                  }}
                />
              </Group>

              <Group gap="xs" wrap="nowrap">
                <TimeInput
                  value={'open' in daySchedule ? daySchedule.open : '09:00'}
                  disabled={disabled || isClosed}
                  size="sm"
                  w={100}
                  aria-label={`${t(`store.${key}` as const)} opening time`}
                  styles={{
                    input: {
                      opacity: isClosed ? 0.5 : 1,
                    },
                  }}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    handleTimeChange(key, 'open', event.target.value);
                  }}
                />

                <Text size="sm" c="dimmed">
                  {t('store.to')}
                </Text>

                <TimeInput
                  value={'close' in daySchedule ? daySchedule.close : '17:00'}
                  disabled={disabled || isClosed}
                  size="sm"
                  w={100}
                  aria-label={`${t(`store.${key}` as const)} closing time`}
                  styles={{
                    input: {
                      opacity: isClosed ? 0.5 : 1,
                    },
                  }}
                  onChange={(event) => {
                    handleTimeChange(key, 'close', event.target.value);
                  }}
                />
                <Tooltip label={t('store.applyForAll')} position="top">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={disabled}
                    aria-label={t('store.applyForAll')}
                    onClick={() => {
                      copyToAllDays(key);
                    }}
                  >
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Paper>
        );
      })}

      <Text size="xs" c="dimmed" ta="center" mt="md">
        {t('store.operatingHoursTip')}
      </Text>
    </Stack>
  );
}
