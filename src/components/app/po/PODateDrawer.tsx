import { Stack, Button, Group } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';

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
  const { t } = useTranslation();
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
      <Stack gap="md">
        <DatePickerInput
          label={t('po.startDate')}
          placeholder={t('po.selectStartDate')}
          clearable
          value={tempStartDate}
          onChange={(date) => setTempStartDate(date ? new Date(date) : undefined)}
          maxDate={tempEndDate}
        />

        <DatePickerInput
          label={t('po.endDate')}
          placeholder={t('po.selectEndDate')}
          clearable
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
    </Drawer>
  );
}
