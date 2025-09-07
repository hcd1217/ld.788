import { Stack, Button, Group } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DELIVERY_STATUS, type DeliveryStatusType } from '@/constants/deliveryRequest';
import { useState, useEffect } from 'react';

interface DeliveryStatusFilterDrawerProps {
  readonly opened: boolean;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly onClose: () => void;
  readonly onStatusToggle: (status: DeliveryStatusType) => void;
  readonly onApply: () => void;
  readonly onClear: () => void;
}

export function DeliveryStatusFilterDrawer({
  opened,
  selectedStatuses,
  onClose,
  onStatusToggle,
  onApply,
  onClear,
}: DeliveryStatusFilterDrawerProps) {
  const { t } = useTranslation();

  // Local state to handle selections without triggering page reload
  const [localStatuses, setLocalStatuses] = useState<DeliveryStatusType[]>(selectedStatuses);

  // Sync local state when drawer opens or selectedStatuses changes
  useEffect(() => {
    if (opened) {
      setLocalStatuses(selectedStatuses);
    }
  }, [opened, selectedStatuses]);

  const statusOptions = [
    { value: DELIVERY_STATUS.PENDING, label: t('delivery.status.pending') },
    { value: DELIVERY_STATUS.IN_TRANSIT, label: t('delivery.status.inTransit') },
    { value: DELIVERY_STATUS.COMPLETED, label: t('delivery.status.completed') },
  ];

  const isAllSelected = localStatuses.length === 0;
  const selectedCount = isAllSelected ? 0 : localStatuses.length;

  const handleStatusToggle = (status: DeliveryStatusType) => {
    setLocalStatuses((prev) => {
      const isSelected = prev.includes(status);
      if (isSelected) {
        // Remove status
        return prev.filter((s) => s !== status);
      } else {
        // Add status
        return [...prev, status];
      }
    });
  };

  const handleApply = () => {
    // Apply local changes to actual filters
    if (localStatuses.length === 0) {
      // Empty array means ALL selected
      onStatusToggle(DELIVERY_STATUS.ALL);
    } else {
      // Clear and then apply selected statuses
      onClear();
      localStatuses.forEach((status) => onStatusToggle(status));
    }
    onApply();
    onClose();
  };

  const handleClear = () => {
    setLocalStatuses([]);
    onClear();
    onClose();
  };

  const handleSelectAll = () => {
    setLocalStatuses([]);
  };

  return (
    <Drawer
      opened={opened}
      size="50vh"
      position="bottom"
      title={
        selectedCount > 0
          ? `${t('delivery.filters.selectStatus')} (${selectedCount})`
          : t('delivery.filters.selectStatus')
      }
      onClose={onClose}
    >
      <Stack gap="xs">
        {/* All statuses option */}
        <Button
          size="sm"
          variant={isAllSelected ? 'filled' : 'light'}
          onClick={handleSelectAll}
          fullWidth
          styles={{ label: { textAlign: 'left' } }}
        >
          {t('delivery.filters.allStatus')}
        </Button>

        {/* Status options */}
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={localStatuses.includes(option.value) ? 'filled' : 'light'}
            onClick={() => handleStatusToggle(option.value)}
            fullWidth
            styles={{ label: { textAlign: 'left' } }}
          >
            {option.label}
          </Button>
        ))}
      </Stack>

      {/* Footer actions */}
      <Group justify="space-between" mt="xl">
        <Button variant="subtle" color="red" onClick={handleClear}>
          {t('common.clear')}
        </Button>
        <Button onClick={handleApply}>{t('common.apply')}</Button>
      </Group>
    </Drawer>
  );
}
