import { Stack, Button, Checkbox, Group, ScrollArea } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';
import { useState, useEffect } from 'react';

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

  const statusOptions = [
    { value: PO_STATUS.NEW, label: t('po.status.NEW') },
    { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
    { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
    { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
    { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
    { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
    { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
  ];

  const isAllSelected = localStatuses.length === 0;
  const selectedCount = isAllSelected ? 0 : localStatuses.length;

  const handleAllToggle = () => {
    if (isAllSelected) {
      // If ALL is selected (empty array), select all individual statuses
      const allStatuses = statusOptions.map((option) => option.value);
      setLocalStatuses(allStatuses);
    } else {
      // If some statuses are selected, clear all (select ALL)
      setLocalStatuses([]);
    }
  };

  const handleStatusToggle = (status: POStatusType) => {
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
      onStatusToggle(PO_STATUS.ALL);
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

  return (
    <Drawer
      opened={opened}
      size="40vh"
      position="bottom"
      title={
        selectedCount > 0 ? `${t('po.selectStatus')} (${selectedCount})` : t('po.selectStatus')
      }
      onClose={onClose}
    >
      <Stack gap="md" h="100%">
        <ScrollArea h="calc(100% - 60px)" offsetScrollbars>
          <Stack gap="md">
            {/* All option */}
            <Checkbox
              label={t('po.allStatus')}
              checked={isAllSelected}
              onChange={() => handleAllToggle()}
            />

            {/* Individual status options */}
            <Stack gap="xs" pl="md">
              {statusOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={!isAllSelected && localStatuses.includes(option.value)}
                  disabled={isAllSelected}
                  onChange={() => handleStatusToggle(option.value)}
                />
              ))}
            </Stack>
          </Stack>
        </ScrollArea>

        {/* Action buttons - fixed at bottom */}
        <Group grow>
          <Button variant="light" onClick={handleClear}>
            {t('common.clear')}
          </Button>
          <Button onClick={handleApply}>{t('common.apply')}</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
