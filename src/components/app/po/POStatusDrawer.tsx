import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Checkbox, Group, Stack } from '@mantine/core';

import { Drawer } from '@/components/common';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { useTranslation } from '@/hooks/useTranslation';

interface POStatusDrawerProps {
  readonly opened: boolean;
  readonly selectedStatuses: POStatusType[];
  readonly onClose: () => void;
  readonly onStatusToggle: (status: POStatusType) => void;
  readonly onApply: () => void;
  readonly onClear: () => void;
}

export function POStatusDrawer({
  opened,
  selectedStatuses,
  onClose,
  onStatusToggle,
  onApply,
  onClear,
}: POStatusDrawerProps) {
  const { t } = useTranslation();

  // Local state to handle selections without triggering page reload
  const [localStatuses, setLocalStatuses] = useState<POStatusType[]>(selectedStatuses);

  // Sync local state when drawer opens or selectedStatuses changes
  useEffect(() => {
    if (opened) {
      setLocalStatuses(selectedStatuses);
    }
  }, [opened, selectedStatuses]);

  const statusOptions = useMemo(
    () => [
      { value: PO_STATUS.NEW, label: t('po.status.NEW') },
      { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
      { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
      { value: PO_STATUS.READY_FOR_PICKUP, label: t('po.status.READY_FOR_PICKUP') },
      { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
      { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
      { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
      { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
    ],
    [t],
  );

  const selectedCount = localStatuses.length;
  const isAllSelected = selectedCount === statusOptions.length;

  const handleAllToggle = useCallback(() => {
    const isAllSelected = localStatuses.length === statusOptions.length;
    if (isAllSelected) {
      // If ALL is selected, clear all
      setLocalStatuses([]);
      return;
    }

    // If ALL is not selected, select all individual statuses
    const allStatuses = statusOptions.map((option) => option.value);
    setLocalStatuses(allStatuses);
  }, [localStatuses, statusOptions]);

  const handleStatusToggle = useCallback((status: POStatusType) => {
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
  }, []);

  const handleApply = useCallback(() => {
    // Apply local changes to actual filters
    if (localStatuses.length === 0) {
      // Empty array means ALL selected
      onStatusToggle(PO_STATUS.ALL);
    } else {
      // Clear and then apply selected statuses
      onClear();
      localStatuses.forEach((status) => onStatusToggle(status));
    }
    onApply();
    onClose();
  }, [localStatuses, onStatusToggle, onClear, onApply, onClose]);

  const handleClear = useCallback(() => {
    setLocalStatuses([]);
    onClear();
    onClose();
  }, [onClear, onClose]);

  return (
    <Drawer
      opened={opened}
      expanded
      position="bottom"
      title={
        selectedCount > 0 ? `${t('po.selectStatus')} (${selectedCount})` : t('po.selectStatus')
      }
      onClose={onClose}
    >
      <Stack gap="md" h="100%">
        <Stack gap="md">
          {/* All option */}
          <Checkbox
            label={t('common.filters.allStatus')}
            checked={isAllSelected}
            onChange={() => handleAllToggle()}
          />

          {/* Individual status options */}
          <Stack gap="xs" pl="md">
            {statusOptions.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={localStatuses.includes(option.value)}
                disabled={isAllSelected}
                onChange={() => handleStatusToggle(option.value)}
              />
            ))}
          </Stack>
        </Stack>
        <Group grow mt="xl">
          <Button variant="light" onClick={handleClear}>
            {t('common.clear')}
          </Button>
          <Button onClick={handleApply}>{t('common.apply')}</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
