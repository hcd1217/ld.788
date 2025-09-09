import {
  DateInput as MantineDateInput,
  type DateValue,
  type DateInputProps as MantineDateInputProps,
} from '@mantine/dates';
import { useTranslation } from '@/hooks/useTranslation';

type DateInputProps = Omit<MantineDateInputProps, 'valueFormat' | 'onChange'> & {
  readonly dateOnly?: boolean;
  readonly onChange: (date: string | undefined) => void;
};

export function DateInput({ dateOnly = true, onChange, ...props }: DateInputProps) {
  const { currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';
  return (
    <MantineDateInput
      {...props}
      valueFormat={valueFormat}
      onChange={(date) => {
        if (!onChange) {
          return;
        }
        if (!date) {
          onChange(undefined);
          return;
        }
        if (isValidDate(date)) {
          if (dateOnly) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            onChange(d.toISOString());
          } else {
            onChange(new Date(date).toISOString());
          }
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
