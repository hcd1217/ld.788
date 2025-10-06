import { useEffect, useState } from 'react';

import { Button, Group, Stack } from '@mantine/core';

import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useClientConfig, useEmployees } from '@/stores/useAppStore';

interface DeliveryEmployeeFilterDrawerProps {
  readonly opened: boolean;
  readonly selectedEmployeeId?: string;
  readonly onClose: () => void;
  readonly onEmployeeChange: (employeeId: string | undefined) => void;
}

export function DeliveryEmployeeFilterDrawer({
  opened,
  selectedEmployeeId,
  onClose,
  onEmployeeChange,
}: DeliveryEmployeeFilterDrawerProps) {
  const { t } = useTranslation();
  const employees = useEmployees();
  const clientConfig = useClientConfig();

  // Local state to handle selections without triggering page reload
  const [localEmployeeId, setLocalEmployeeId] = useState<string | undefined>(selectedEmployeeId);

  // Sync local state when drawer opens or selectedEmployeeId changes
  useEffect(() => {
    if (opened) {
      setLocalEmployeeId(selectedEmployeeId);
    }
  }, [opened, selectedEmployeeId]);

  // Employee options - filtered by assigneeIds from clientConfig
  const employeeOptions = (() => {
    const assigneeIds = clientConfig.features?.deliveryRequest?.assigneeIds ?? [];

    // Filter employees based on assigneeIds if configured, otherwise show all
    const filteredEmployees =
      assigneeIds.length > 0
        ? employees.filter((employee) => assigneeIds.includes(employee.id))
        : employees;

    return filteredEmployees;
  })();

  const isAllSelected = !localEmployeeId;

  const handleEmployeeSelect = (employeeId: string | undefined) => {
    setLocalEmployeeId(employeeId);
  };

  const handleApply = () => {
    onEmployeeChange(localEmployeeId);
    onClose();
  };

  const handleClear = () => {
    setLocalEmployeeId(undefined);
    onEmployeeChange(undefined);
    onClose();
  };

  const handleSelectAll = () => {
    setLocalEmployeeId(undefined);
  };

  return (
    <Drawer
      opened={opened}
      expanded
      position="bottom"
      title={t('delivery.filters.selectEmployee')}
      onClose={onClose}
    >
      <Stack gap="xs">
        {/* All employees option */}
        <Button
          size="sm"
          variant={isAllSelected ? 'filled' : 'light'}
          onClick={handleSelectAll}
          fullWidth
          styles={{ label: { textAlign: 'left' } }}
        >
          {t('delivery.filters.allEmployees')}
        </Button>

        {/* Employee options */}
        {employeeOptions.map((employee) => (
          <Button
            key={employee.id}
            size="sm"
            variant={localEmployeeId === employee.id ? 'filled' : 'light'}
            onClick={() => handleEmployeeSelect(employee.id)}
            fullWidth
            styles={{ label: { textAlign: 'left' } }}
          >
            {employee.fullName}
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
