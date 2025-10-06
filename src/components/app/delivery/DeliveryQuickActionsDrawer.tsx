import { useState } from 'react';

import { Button, Stack } from '@mantine/core';

import { DatePickerInput, Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from '@/utils/time';

interface DeliveryQuickActionsDrawerProps {
  readonly opened: boolean;
  readonly selectedAction?: string;
  readonly onClose: () => void;
  readonly onActionSelect: (
    action: string | undefined,
    dateRange?: { start: Date; end: Date },
  ) => void;
}

export function DeliveryQuickActionsDrawer({
  opened,
  selectedAction,
  onClose,
  onActionSelect,
}: DeliveryQuickActionsDrawerProps) {
  const { t } = useTranslation();
  const [customDateRange, setCustomDateRange] = useState<
    [string | Date | undefined, string | Date | undefined]
  >([undefined, undefined]);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handleActionSelect = (action: string, dateRange?: { start: Date; end: Date }) => {
    onActionSelect(action, dateRange);
    setShowCustomPicker(false);
    onClose();
  };

  const handleClear = () => {
    onActionSelect(undefined);
    setCustomDateRange([undefined, undefined]);
    setShowCustomPicker(false);
    onClose();
  };

  const handleCustomRangeClick = () => {
    setShowCustomPicker(!showCustomPicker);
  };

  const handleCustomDateChange = (dates: [string | undefined, string | undefined]) => {
    setCustomDateRange(dates);

    // Only apply when both dates are selected
    const [start, end] = dates;
    if (start && end) {
      handleActionSelect(t('delivery.quickActions.customRange'), {
        start: new Date(start),
        end: new Date(end),
      });
    }
  };

  const today = new Date();

  const quickActions = [
    {
      label: t('delivery.quickActions.today'),
      value: 'today',
      dateRange: {
        start: startOfDay(today),
        end: endOfDay(today),
      },
    },
    {
      label: t('delivery.quickActions.thisWeek'),
      value: 'thisWeek',
      dateRange: {
        start: startOfWeek(today),
        end: endOfWeek(today),
      },
    },
    {
      label: t('delivery.quickActions.thisMonth'),
      value: 'thisMonth',
      dateRange: {
        start: startOfMonth(today),
        end: endOfMonth(today),
      },
    },
  ];

  return (
    <Drawer
      opened={opened}
      expanded
      position="bottom"
      title={t('delivery.quickActions.title')}
      onClose={onClose}
    >
      <Stack gap="sm">
        {/* All Dates option */}
        <Button
          size="sm"
          variant={!selectedAction ? 'filled' : 'light'}
          onClick={handleClear}
          fullWidth
          styles={{ label: { textAlign: 'left' } }}
        >
          {t('delivery.quickActions.allDates')}
        </Button>

        {/* Quick action options */}
        {quickActions.map((action) => (
          <Button
            key={action.value}
            size="sm"
            variant={selectedAction === action.value ? 'filled' : 'light'}
            onClick={() => handleActionSelect(action.label, action.dateRange)}
            fullWidth
            styles={{ label: { textAlign: 'left' } }}
          >
            {action.label}
          </Button>
        ))}

        {/* Custom Date Range option */}
        <Button
          size="sm"
          variant={
            selectedAction === t('delivery.quickActions.customRange') && !showCustomPicker
              ? 'filled'
              : 'light'
          }
          onClick={handleCustomRangeClick}
          fullWidth
          styles={{ label: { textAlign: 'left' } }}
        >
          {t('delivery.quickActions.customRange')}
        </Button>

        {/* Custom Date Range Picker - shown when button clicked */}
        {showCustomPicker && (
          <DatePickerInput
            placeholder={t('delivery.filters.selectScheduledDate')}
            value={customDateRange}
            onChange={handleCustomDateChange}
            size="sm"
          />
        )}
      </Stack>
    </Drawer>
  );
}
