import { useEffect, useMemo, useState } from 'react';

import { Button, Group, MultiSelect, Select } from '@mantine/core';
import { IconCheck, IconClearAll } from '@tabler/icons-react';

import { DatePickerInput } from '@/components/common';
import { SearchBar } from '@/components/common';
import { DELIVERY_STATUS, type DeliveryStatusType } from '@/constants/deliveryRequest';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useClientConfig,
  useCustomerOptions,
  useEmployees,
  usePermissions,
} from '@/stores/useAppStore';
import { canFilterDeliveryRequest } from '@/utils/permission.utils';
import 'dayjs/locale/vi';
import 'dayjs/locale/en';

interface DeliveryFilterBarDesktopProps {
  readonly searchQuery: string;
  readonly customerId?: string;
  readonly assignedTo?: string;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly scheduledDateStart?: Date;
  readonly scheduledDateEnd?: Date;
  readonly hasActiveFilters: boolean;
  readonly onSearchChange: (query: string) => void;
  readonly onCustomerChange: (customerId: string | undefined) => void;
  readonly onAssignedToChange: (assignedTo: string | undefined) => void;
  readonly onStatusesChange: (statuses: DeliveryStatusType[]) => void;
  readonly onScheduledDateChange: (start: Date | undefined, end: Date | undefined) => void;
  readonly onClearFilters: () => void;
}

export function DeliveryFilterBarDesktop({
  searchQuery,
  customerId,
  assignedTo,
  selectedStatuses,
  scheduledDateStart,
  scheduledDateEnd,
  hasActiveFilters,
  onSearchChange,
  onCustomerChange,
  onAssignedToChange,
  onStatusesChange,
  onScheduledDateChange,
  onClearFilters,
}: DeliveryFilterBarDesktopProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const employees = useEmployees();
  const clientConfig = useClientConfig();
  const customerOptions = useCustomerOptions();

  const canFilter = useMemo(() => canFilterDeliveryRequest(permissions), [permissions]);

  // Local state for pending status changes
  const [pendingStatuses, setPendingStatuses] = useState<DeliveryStatusType[]>(selectedStatuses);

  // Sync local state when external filters change (e.g., clear filters)
  useEffect(() => {
    setPendingStatuses(selectedStatuses);
  }, [selectedStatuses]);

  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    if (pendingStatuses.length !== selectedStatuses.length) return true;
    return !pendingStatuses.every((status) => selectedStatuses.includes(status));
  }, [pendingStatuses, selectedStatuses]);

  // Apply pending status changes
  const handleApplyStatuses = () => {
    onStatusesChange(pendingStatuses);
  };

  // Employee options for Select - filtered by assigneeIds from clientConfig
  const employeeOptions = useMemo(() => {
    const assigneeIds = clientConfig.features?.deliveryRequest?.assigneeIds ?? [];

    // Filter employees based on assigneeIds if configured, otherwise show all
    const filteredEmployees =
      assigneeIds.length > 0
        ? employees.filter((employee) => assigneeIds.includes(employee.id))
        : employees;

    return [
      { value: '', label: t('delivery.filters.selectAssignee') },
      ...filteredEmployees.map((employee) => ({
        value: employee.id,
        label: employee.fullName,
      })),
    ];
  }, [employees, clientConfig.features?.deliveryRequest, t]);

  // Status options for MultiSelect
  const statusOptions = useMemo(
    () => [
      { value: DELIVERY_STATUS.PENDING, label: t('delivery.statuses.pending') },
      { value: DELIVERY_STATUS.IN_TRANSIT, label: t('delivery.statuses.inTransit') },
      { value: DELIVERY_STATUS.COMPLETED, label: t('delivery.statuses.completed') },
    ],
    [t],
  );

  // Custom placeholder for MultiSelect to show count - use pendingStatuses for display
  const { filteredStatuses, statusPlaceholder } = useMemo(() => {
    // Filter out 'all' status if present
    const filteredStatuses = pendingStatuses.filter((s) => s !== DELIVERY_STATUS.ALL);
    const count = filteredStatuses.length;
    if (count === 0) {
      return { filteredStatuses, statusPlaceholder: t('common.filters.selectStatus') };
    }
    if (count === 1) {
      return {
        filteredStatuses,
        statusPlaceholder: statusOptions.find((s) => s.value === filteredStatuses[0])?.label,
      };
    }
    return {
      filteredStatuses,
      statusPlaceholder: t('common.statusesSelected', { count }),
    };
  }, [pendingStatuses, statusOptions, t]);

  if (!canFilter) {
    return null;
  }

  return (
    <Group justify="start" align="flex-end" gap="sm" wrap="nowrap" mb="xl">
      {/* Search Bar - flex 2 */}
      <div style={{ flex: 2, minWidth: 150, maxWidth: 250 }}>
        <SearchBar
          placeholder={t('delivery.filters.searchPlaceholder')}
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
        />
      </div>

      {/* Customer Select - flex 1 */}
      <Select
        clearable
        searchable
        placeholder={t('common.filters.selectCustomer')}
        data={customerOptions}
        value={customerId || ''}
        style={{ flex: 1, minWidth: 150 }}
        onChange={(value) => onCustomerChange(value || undefined)}
        label={t('common.customer') as string}
      />

      {/* Assignee Select - flex 1 */}
      <Select
        clearable
        searchable
        placeholder={t('delivery.filters.selectAssignee')}
        data={employeeOptions}
        value={assignedTo || ''}
        style={{ flex: 1, minWidth: 150 }}
        onChange={(value) => onAssignedToChange(value || undefined)}
        label={t('delivery.assignedTo') as string}
      />

      {/* Status MultiSelect - flex 1 */}
      <MultiSelect
        clearable
        searchable
        placeholder={statusPlaceholder}
        data={statusOptions}
        value={filteredStatuses}
        style={{ flex: 1, minWidth: 180 }}
        onChange={(values) => setPendingStatuses(values as DeliveryStatusType[])}
        label={t('delivery.status') as string}
        maxDropdownHeight={280}
        styles={{
          input: {
            minHeight: 36,
            height: 'auto',
          },
          pill: {
            display: 'none',
          },
        }}
        hidePickedOptions={false}
      />

      {/* Apply Status Button */}
      <Button
        disabled={!hasPendingChanges}
        variant="filled"
        leftSection={<IconCheck size={16} />}
        onClick={handleApplyStatuses}
      >
        {t('common.apply')}
      </Button>

      {/* Scheduled Date Range */}
      <DatePickerInput
        label={t('delivery.scheduledDate')}
        placeholder={t('delivery.filters.selectScheduledDate')}
        value={[scheduledDateStart, scheduledDateEnd]}
        style={{ flex: 1.5, minWidth: 220 }}
        onChange={(dates) => {
          if (!dates) {
            onScheduledDateChange(undefined, undefined);
          } else {
            const [start, end] = dates;
            const startDate = start ? new Date(start) : undefined;
            const endDate = end ? new Date(end) : undefined;
            onScheduledDateChange(startDate, endDate);
          }
        }}
      />

      {/* Clear Button */}
      <Button
        disabled={!hasActiveFilters}
        variant="subtle"
        leftSection={<IconClearAll size={16} />}
        onClick={onClearFilters}
      >
        {t('common.clear')}
      </Button>
    </Group>
  );
}
