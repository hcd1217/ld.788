import { Stack, Button, Group, Tabs } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { IconCalendar, IconCheckupList } from '@tabler/icons-react';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface DeliveryDateDrawerProps {
  readonly opened: boolean;
  readonly scheduledDateStart?: Date;
  readonly scheduledDateEnd?: Date;
  readonly completedDateStart?: Date;
  readonly completedDateEnd?: Date;
  readonly onClose: () => void;
  readonly onScheduledDateRangeSelect: (start?: Date, end?: Date) => void;
  readonly onCompletedDateRangeSelect: (start?: Date, end?: Date) => void;
}

export function DeliveryDateDrawer({
  opened,
  scheduledDateStart,
  scheduledDateEnd,
  completedDateStart,
  completedDateEnd,
  onClose,
  onScheduledDateRangeSelect,
  onCompletedDateRangeSelect,
}: DeliveryDateDrawerProps) {
  const { t, currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';

  const [activeTab, setActiveTab] = useState<'scheduled' | 'completed'>('scheduled');
  const [tempScheduledStartDate, setTempScheduledStartDate] = useState<Date | undefined>(
    scheduledDateStart,
  );
  const [tempScheduledEndDate, setTempScheduledEndDate] = useState<Date | undefined>(
    scheduledDateEnd,
  );
  const [tempCompletedStartDate, setTempCompletedStartDate] = useState<Date | undefined>(
    completedDateStart,
  );
  const [tempCompletedEndDate, setTempCompletedEndDate] = useState<Date | undefined>(
    completedDateEnd,
  );

  const handleApply = () => {
    onScheduledDateRangeSelect(tempScheduledStartDate, tempScheduledEndDate);
    onCompletedDateRangeSelect(tempCompletedStartDate, tempCompletedEndDate);
    onClose();
  };

  const handleClearAll = () => {
    setTempScheduledStartDate(undefined);
    setTempScheduledEndDate(undefined);
    setTempCompletedStartDate(undefined);
    setTempCompletedEndDate(undefined);
    onScheduledDateRangeSelect(undefined, undefined);
    onCompletedDateRangeSelect(undefined, undefined);
    onClose();
  };

  // Reset temp dates when drawer opens
  useEffect(() => {
    if (opened) {
      setTempScheduledStartDate(scheduledDateStart);
      setTempScheduledEndDate(scheduledDateEnd);
      setTempCompletedStartDate(completedDateStart);
      setTempCompletedEndDate(completedDateEnd);
      setActiveTab('scheduled');
    }
  }, [opened, scheduledDateStart, scheduledDateEnd, completedDateStart, completedDateEnd]);

  return (
    <Drawer opened={opened} size="360px" title={t('po.selectDateRange')} onClose={onClose}>
      <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        <Stack gap="md">
          <Tabs
            value={activeTab}
            onChange={(value) => {
              if (value === 'scheduled' || value === 'completed') {
                setActiveTab(value as 'scheduled' | 'completed');
              }
            }}
          >
            <Tabs.List grow>
              <Tabs.Tab value="scheduled" leftSection={<IconCalendar size={16} />}>
                {t('po.deliveryDate')}
              </Tabs.Tab>
              <Tabs.Tab value="completed" leftSection={<IconCheckupList size={16} />}>
                {t('po.orderDate')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="scheduled" pt="md">
              <Stack gap="md">
                <DatePickerInput
                  label={t('po.startDate')}
                  placeholder={t('po.selectStartDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempScheduledStartDate}
                  onChange={(date) => setTempScheduledStartDate(date ? new Date(date) : undefined)}
                  maxDate={tempScheduledEndDate}
                />
                <DatePickerInput
                  label={t('po.endDate')}
                  placeholder={t('po.selectEndDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempScheduledEndDate}
                  onChange={(date) => setTempScheduledEndDate(date ? new Date(date) : undefined)}
                  minDate={tempScheduledStartDate}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="completed" pt="md">
              <Stack gap="md">
                <DatePickerInput
                  label={t('po.startDate')}
                  placeholder={t('po.selectStartDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempCompletedStartDate}
                  onChange={(date) => setTempCompletedStartDate(date ? new Date(date) : undefined)}
                  maxDate={tempCompletedEndDate}
                />
                <DatePickerInput
                  label={t('po.endDate')}
                  placeholder={t('po.selectEndDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempCompletedEndDate}
                  onChange={(date) => setTempCompletedEndDate(date ? new Date(date) : undefined)}
                  minDate={tempCompletedStartDate}
                />
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group grow mt="md">
            <Button variant="light" onClick={handleClearAll}>
              {t('common.clearAll')}
            </Button>
            <Button onClick={handleApply}>{t('common.apply')}</Button>
          </Group>
        </Stack>
      </DatesProvider>
    </Drawer>
  );
}
