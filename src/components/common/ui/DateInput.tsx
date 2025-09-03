import {
  DateInput as MantineDateInput,
  type DateValue,
  type DateInputProps as MantineDateInputProps,
} from '@mantine/dates';

type DateInputProps = Omit<MantineDateInputProps, 'onChange'> & {
  readonly onChange: (date: DateValue | null) => void;
};

export function DateInput({ onChange, ...props }: DateInputProps) {
  return (
    <MantineDateInput
      {...props}
      onChange={(date) => {
        if (!onChange) {
          return;
        }
        if (!date) {
          onChange(null);
          return;
        }
        if (isValidDate(date)) {
          onChange(new Date(date).toISOString());
        }
      }}
    />
  );
}

function isValidDate(date?: DateValue): date is string {
  if (date === undefined) {
    return true;
  }
  if (date === null) {
    return true;
  }
  return !Number.isNaN(new Date(date).getTime());
}
