import { Stack, Button } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
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

  const handleActionSelect = (action: string, dateRange?: { start: Date; end: Date }) => {
    onActionSelect(action, dateRange);
    onClose();
  };

  const handleClear = () => {
    onActionSelect(undefined);
    onClose();
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
      size="40vh"
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
      </Stack>
    </Drawer>
  );
}
