import { Stack, Button, Group } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useState } from 'react';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface PODateDrawerProps {
  readonly opened: boolean;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly onClose: () => void;
  readonly onDateRangeSelect: (start?: Date, end?: Date) => void;
}

export function PODateDrawer({
  opened,
  startDate,
  endDate,
  onClose,
  onDateRangeSelect,
}: PODateDrawerProps) {
  const { t, currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);

  const handleApply = () => {
    onDateRangeSelect(tempStartDate, tempEndDate);
    onClose();
  };

  const handleClear = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    onDateRangeSelect(undefined, undefined);
    onClose();
  };

  // Reset temp dates when drawer opens
  const handleOpen = () => {
    if (opened) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  };

  // Use effect to reset dates when drawer opens
  useState(() => {
    handleOpen();
  });

  return (
    <Drawer opened={opened} size="280px" title={t('po.selectDateRange')} onClose={onClose}>
      <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        <Stack gap="md">
          <DatePickerInput
            label={t('po.startDate')}
            placeholder={t('po.selectStartDate')}
            clearable
            valueFormat={valueFormat}
            value={tempStartDate}
            onChange={(date) => setTempStartDate(date ? new Date(date) : undefined)}
            maxDate={tempEndDate}
          />

          <DatePickerInput
            label={t('po.endDate')}
            placeholder={t('po.selectEndDate')}
            clearable
            valueFormat={valueFormat}
            value={tempEndDate}
            onChange={(date) => setTempEndDate(date ? new Date(date) : undefined)}
            minDate={tempStartDate}
          />

          <Group grow mt="md">
            <Button variant="light" onClick={handleClear}>
              {t('common.clear')}
            </Button>
            <Button onClick={handleApply}>{t('common.apply')}</Button>
          </Group>
        </Stack>
      </DatesProvider>
    </Drawer>
  );
}
