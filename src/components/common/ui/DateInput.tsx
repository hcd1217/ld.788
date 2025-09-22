import { useEffect, useRef } from 'react';

import {
  type DateValue,
  DateInput as MantineDateInput,
  type DateInputProps as MantineDateInputProps,
} from '@mantine/dates';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

type DateInputProps = Omit<MantineDateInputProps, 'valueFormat' | 'onChange'> & {
  readonly dateOnly?: boolean;
  readonly onChange: (date: string | undefined) => void;
};

export function DateInput({ dateOnly = true, onChange, ...props }: DateInputProps) {
  const { currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';
  const { isMobile } = useDeviceType();
  const inputRef = useRef<HTMLInputElement>(null);

  // Prevent keyboard on mobile by making input readonly after mount
  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.setAttribute('readonly', 'true');
      inputRef.current.setAttribute('inputmode', 'none');
    }
  }, [isMobile]);

  return (
    <MantineDateInput
      {...props}
      ref={inputRef}
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
