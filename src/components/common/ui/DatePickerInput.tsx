import {
  DatePickerInput as MantineDatePickerInput,
  type DatePickerInputProps as MantineDatePickerInputProps,
} from '@mantine/dates';

type DatePickerInputProps = Omit<
  MantineDatePickerInputProps<'range'>,
  'value' | 'type' | 'onChange' | 'clearable'
> & {
  readonly value: [string | Date | undefined, string | Date | undefined];
  readonly onChange: (dates: [string | undefined, string | undefined]) => void;
};

export function DatePickerInput({ onChange, value, ...props }: DatePickerInputProps) {
  return (
    <MantineDatePickerInput
      {...props}
      clearable
      type="range"
      value={[value[0] ?? null, value[1] ?? null]}
      onChange={(dates) => {
        if (!dates) {
          onChange([undefined, undefined]);
          return;
        }
        let start: string | undefined = dates[0] ?? undefined;
        let end: string | undefined = dates[1] ?? undefined;
        if (start) {
          start = new Date(new Date(start).setHours(0, 0, 0, 0)).toISOString();
        }
        if (end) {
          end = new Date(new Date(end).setHours(23, 59, 59, 999)).toISOString();
        }

        onChange([start ?? undefined, end ?? undefined]);
      }}
    />
  );
}
