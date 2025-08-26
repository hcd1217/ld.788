import { Stack, Button, Group, Tabs } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { IconCalendar, IconTruck } from '@tabler/icons-react';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface PODateDrawerProps {
  readonly opened: boolean;
  readonly orderDateStart?: Date;
  readonly orderDateEnd?: Date;
  readonly deliveryDateStart?: Date;
  readonly deliveryDateEnd?: Date;
  readonly onClose: () => void;
  readonly onOrderDateRangeSelect: (start?: Date, end?: Date) => void;
  readonly onDeliveryDateRangeSelect: (start?: Date, end?: Date) => void;
}

export function PODateDrawer({
  opened,
  orderDateStart,
  orderDateEnd,
  deliveryDateStart,
  deliveryDateEnd,
  onClose,
  onOrderDateRangeSelect,
  onDeliveryDateRangeSelect,
}: PODateDrawerProps) {
  const { t, currentLanguage } = useTranslation();
  const valueFormat = currentLanguage === 'vi' ? 'DD/MM/YYYY' : 'MMM DD, YYYY';

  const [activeTab, setActiveTab] = useState<'delivery' | 'order'>('delivery');
  const [tempOrderStartDate, setTempOrderStartDate] = useState<Date | undefined>(orderDateStart);
  const [tempOrderEndDate, setTempOrderEndDate] = useState<Date | undefined>(orderDateEnd);
  const [tempDeliveryStartDate, setTempDeliveryStartDate] = useState<Date | undefined>(
    deliveryDateStart,
  );
  const [tempDeliveryEndDate, setTempDeliveryEndDate] = useState<Date | undefined>(deliveryDateEnd);

  const handleApply = () => {
    onOrderDateRangeSelect(tempOrderStartDate, tempOrderEndDate);
    onDeliveryDateRangeSelect(tempDeliveryStartDate, tempDeliveryEndDate);
    onClose();
  };

  const handleClearAll = () => {
    setTempOrderStartDate(undefined);
    setTempOrderEndDate(undefined);
    setTempDeliveryStartDate(undefined);
    setTempDeliveryEndDate(undefined);
    onOrderDateRangeSelect(undefined, undefined);
    onDeliveryDateRangeSelect(undefined, undefined);
    onClose();
  };

  // Reset temp dates when drawer opens
  useEffect(() => {
    if (opened) {
      setTempOrderStartDate(orderDateStart);
      setTempOrderEndDate(orderDateEnd);
      setTempDeliveryStartDate(deliveryDateStart);
      setTempDeliveryEndDate(deliveryDateEnd);
      setActiveTab('delivery');
    }
  }, [opened, orderDateStart, orderDateEnd, deliveryDateStart, deliveryDateEnd]);

  return (
    <Drawer opened={opened} size="360px" title={t('po.selectDateRange')} onClose={onClose}>
      <DatesProvider settings={{ locale: currentLanguage, firstDayOfWeek: 0, weekendDays: [0, 6] }}>
        <Stack gap="md">
          <Tabs
            value={activeTab}
            onChange={(value) => {
              if (value === 'delivery' || value === 'order') {
                setActiveTab(value as 'delivery' | 'order');
              }
            }}
          >
            <Tabs.List grow>
              <Tabs.Tab value="delivery" leftSection={<IconTruck size={16} />}>
                {t('po.deliveryDate')}
              </Tabs.Tab>
              <Tabs.Tab value="order" leftSection={<IconCalendar size={16} />}>
                {t('po.orderDate')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="order" pt="md">
              <Stack gap="md">
                <DatePickerInput
                  label={t('po.startDate')}
                  placeholder={t('po.selectStartDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempOrderStartDate}
                  onChange={(date) => setTempOrderStartDate(date ? new Date(date) : undefined)}
                  maxDate={tempOrderEndDate}
                />
                <DatePickerInput
                  label={t('po.endDate')}
                  placeholder={t('po.selectEndDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempOrderEndDate}
                  onChange={(date) => setTempOrderEndDate(date ? new Date(date) : undefined)}
                  minDate={tempOrderStartDate}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="delivery" pt="md">
              <Stack gap="md">
                <DatePickerInput
                  label={t('po.startDate')}
                  placeholder={t('po.selectStartDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempDeliveryStartDate}
                  onChange={(date) => setTempDeliveryStartDate(date ? new Date(date) : undefined)}
                  maxDate={tempDeliveryEndDate}
                />
                <DatePickerInput
                  label={t('po.endDate')}
                  placeholder={t('po.selectEndDate')}
                  clearable
                  valueFormat={valueFormat}
                  value={tempDeliveryEndDate}
                  onChange={(date) => setTempDeliveryEndDate(date ? new Date(date) : undefined)}
                  minDate={tempDeliveryStartDate}
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
