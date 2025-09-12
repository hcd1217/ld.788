import { useEffect, useMemo, useState } from 'react';

import { Button, Drawer, Group, Modal, Select, Stack, Switch, Text, Textarea } from '@mantine/core';
import { IconCalendar, IconEdit, IconUrgent } from '@tabler/icons-react';

import { DateInput, UrgentBadge } from '@/components/common';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { useClientConfig, useEmployees } from '@/stores/useAppStore';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';
import { getCustomerNameByCustomerId } from '@/utils/overview';

type DeliveryUpdateModalProps = {
  readonly opened: boolean;
  readonly deliveryRequest?: DeliveryRequest;
  readonly onClose: () => void;
  readonly onConfirm: (data: {
    assignedTo: string;
    assignedType: 'EMPLOYEE' | 'USER';
    scheduledDate: string;
    notes: string;
    isUrgentDelivery?: boolean;
  }) => Promise<void>;
};

export function DeliveryUpdateModal({
  opened,
  deliveryRequest,
  onClose,
  onConfirm,
}: DeliveryUpdateModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const employees = useEmployees();
  const clientConfig = useClientConfig();
  const customerMapByCustomerId = useCustomerMapByCustomerId();

  // Form state - initialize with existing values
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isUrgentDelivery, setIsUrgentDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee options for select - filtered by assigneeIds from clientConfig
  const employeeOptions = useMemo(() => {
    const assigneeIds = clientConfig.features?.deliveryRequest?.assigneeIds ?? [];

    // Filter employees based on assigneeIds if configured, otherwise show all
    const filteredEmployees =
      assigneeIds.length > 0
        ? employees.filter((employee) => assigneeIds.includes(employee.id))
        : employees;

    return filteredEmployees.map((employee) => ({
      value: employee.id,
      label: employee.fullName,
    }));
  }, [employees, clientConfig.features?.deliveryRequest]);

  // Initialize form with existing values when modal opens or deliveryRequest changes
  useEffect(() => {
    if (opened && deliveryRequest) {
      setSelectedEmployeeId(deliveryRequest.assignedTo || null);
      setScheduledDate(
        deliveryRequest.scheduledDate ? new Date(deliveryRequest.scheduledDate) : undefined,
      );
      setNotes(deliveryRequest.notes || '');
      setIsUrgentDelivery(deliveryRequest.isUrgentDelivery || false);
    } else if (!opened) {
      // Reset form when modal closes
      setSelectedEmployeeId(null);
      setScheduledDate(undefined);
      setNotes('');
      setIsUrgentDelivery(false);
    }
  }, [opened, deliveryRequest]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedEmployeeId || !scheduledDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        assignedTo: selectedEmployeeId,
        assignedType: 'EMPLOYEE',
        scheduledDate: scheduledDate.toISOString(),
        notes,
        isUrgentDelivery,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <Stack gap="md">
      {deliveryRequest && (
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('delivery.id')}:
            </Text>
            <Text size="sm" fw={500}>
              {deliveryRequest.deliveryRequestNumber}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('po.customer')}:
            </Text>
            <Text size="sm" fw={500}>
              {getCustomerNameByCustomerId(customerMapByCustomerId, deliveryRequest.customerId)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('po.poNumber')}:
            </Text>
            <Text size="sm" fw={500}>
              {deliveryRequest.purchaseOrderNumber}
            </Text>
          </Group>
        </Stack>
      )}

      <Select
        label={t('delivery.assignedTo')}
        placeholder={t('delivery.form.selectAssignee')}
        data={employeeOptions}
        value={selectedEmployeeId}
        onChange={setSelectedEmployeeId}
        searchable
        required
        leftSection={<IconEdit size={16} />}
      />

      <DateInput
        label={t('delivery.scheduledDate')}
        placeholder={t('delivery.form.selectDate')}
        value={scheduledDate}
        onChange={(date) => setScheduledDate(date ? new Date(date) : undefined)}
        required
        minDate={new Date()}
        leftSection={<IconCalendar size={16} />}
      />

      <Textarea
        label={t('common.notes')}
        placeholder={t('delivery.form.enterNotes')}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        rows={3}
      />

      <Switch
        label={
          <Group gap="xs">
            {t('delivery.urgentDelivery')}
            {isUrgentDelivery && <UrgentBadge size="xs" withIcon={false} />}
          </Group>
        }
        description={t('delivery.form.urgentDeliveryDescription')}
        checked={isUrgentDelivery}
        onChange={(event) => setIsUrgentDelivery(event.currentTarget.checked)}
        size="md"
        color="red"
        thumbIcon={isUrgentDelivery ? <IconUrgent size={12} /> : undefined}
      />

      <Group justify="flex-end" gap="sm">
        <Button variant="light" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedEmployeeId || !scheduledDate}
          leftSection={<IconEdit size={16} />}
        >
          {t('common.form.update')}
        </Button>
      </Group>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title={t('common.form.update')}
        position="bottom"
        size="auto"
        padding="md"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('common.form.update')}
      centered
      size="md"
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
