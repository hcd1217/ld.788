import {Stack, Group, Text, Switch, Paper} from '@mantine/core';
import {TimeInput} from '@mantine/dates';
import {IconClock} from '@tabler/icons-react';

export type DaySchedule = {
  open: string;
  close: string;
} | {closed: true};

type OperatingHours = Record<string, DaySchedule>;

type OperatingHoursInputProps = {
  readonly value: OperatingHours;
  readonly onChange: (operatingHours: OperatingHours) => void;
  readonly disabled?: boolean;
};

const daysOfWeek = [
  {key: 'monday', label: 'Monday'},
  {key: 'tuesday', label: 'Tuesday'},
  {key: 'wednesday', label: 'Wednesday'},
  {key: 'thursday', label: 'Thursday'},
  {key: 'friday', label: 'Friday'},
  {key: 'saturday', label: 'Saturday'},
  {key: 'sunday', label: 'Sunday'},
];

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
    const daySchedule = 'closed' in currentDay
      ? {open: '09:00', close: '17:00'}
      : currentDay;

    const updatedHours = {
      ...value,
      [day]: {
        ...daySchedule,
        [field]: time,
      },
    };
    onChange(updatedHours);
  };

  // Const copyToAllDays = (sourceDay: string) => {
  //   const sourceSchedule = value[sourceDay];
  //   if (!sourceSchedule) return;

  //   const updatedHours: OperatingHours = {};
  //   for (const {key} of daysOfWeek) {
  //     updatedHours[key] = {
  //       open: sourceSchedule.open,
  //       close: sourceSchedule.close,
  //       closed: sourceSchedule.closed,
  //     };
  //   }

  //   onChange(updatedHours);
  // };

  return (
    <Stack gap="md">
      {daysOfWeek.map(({key, label}) => {
        const daySchedule = value[key] || {open: '09:00', close: '17:00'};
        const isClosed = 'closed' in daySchedule && daySchedule.closed === true;

        return (
          <Paper key={key} withBorder p="md">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="md" style={{flex: 1}}>
                <Text w={100} fw={500}>
                  {label}
                </Text>

                <Switch
                  checked={!isClosed}
                  disabled={disabled}
                  label={isClosed ? 'Closed' : 'Open'}
                  size="sm"
                  onChange={() => {
                    handleDayToggle(key);
                  }}
                />
              </Group>

              {!isClosed && 'open' in daySchedule && (
                <Group gap="xs" wrap="nowrap">
                  <TimeInput
                    value={daySchedule.open}
                    disabled={disabled}
                    size="sm"
                    w={100}
                    leftSection={<IconClock size={14} />}
                    aria-label={`${label} opening time`}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      handleTimeChange(key, 'open', event.target.value);
                    }}
                  />

                  <Text size="sm" c="dimmed">
                    to
                  </Text>

                  <TimeInput
                    value={daySchedule.close}
                    disabled={disabled}
                    size="sm"
                    w={100}
                    leftSection={<IconClock size={14} />}
                    aria-label={`${label} closing time`}
                    onChange={(event) => {
                      handleTimeChange(key, 'close', event.target.value);
                    }}
                  />
                </Group>
              )}
            </Group>
          </Paper>
        );
      })}

      <Text size="xs" c="dimmed" ta="center" mt="md">
        💡 Tip: Toggle the switch to mark a day as closed, or set specific
        opening hours for each day.
      </Text>
    </Stack>
  );
}
