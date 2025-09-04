import { Modal, Drawer, Stack, Text, Group, Button, Select, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconTruck, IconCalendar } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useEmployees, useClientConfig } from '@/stores/useAppStore';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';
import type { PICType } from '@/services/sales/deliveryRequest';

type DeliveryRequestModalProps = {
  readonly opened: boolean;
  readonly purchaseOrder?: PurchaseOrder;
  readonly onClose: () => void;
  readonly onConfirm: (data: {
    assignedTo: string;
    assignedType: PICType;
    scheduledDate: string;
    notes: string;
  }) => Promise<void>;
};

export function DeliveryRequestModal({
  opened,
  purchaseOrder,
  onClose,
  onConfirm,
}: DeliveryRequestModalProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const employees = useEmployees();
  const clientConfig = useClientConfig();
  const customerMapByCustomerId = useCustomerMapByCustomerId();

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employee options for select - filtered by assigneeIds from clientConfig
  const employeeOptions = useMemo(() => {
    const assigneeIds = clientConfig.features.deliveryRequest.assigneeIds;

    // Filter employees based on assigneeIds if configured, otherwise show all
    const filteredEmployees =
      assigneeIds.length > 0
        ? employees.filter((employee) => assigneeIds.includes(employee.id))
        : employees;

    return filteredEmployees.map((employee) => ({
      value: employee.id,
      label: employee.fullName,
    }));
  }, [employees, clientConfig.features.deliveryRequest.assigneeIds]);

  // Reset form when modal opens
  const handleOpen = () => {
    if (purchaseOrder) {
      setNotes(`Delivery request for PO ${purchaseOrder.poNumber}`);
    }
  };

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
      });
      // Reset form
      setSelectedEmployeeId(null);
      setScheduledDate(new Date());
      setNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <Stack gap="md">
      {purchaseOrder && (
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('po.poNumber')}:
            </Text>
            <Text size="sm" fw={500}>
              {purchaseOrder.poNumber}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('po.customer')}:
            </Text>
            <Text size="sm" fw={500}>
              {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('po.orderDate')}:
            </Text>
            <Text size="sm" fw={500}>
              {formatDate(purchaseOrder.orderDate)}
            </Text>
          </Group>
        </Stack>
      )}

      <Select
        label={t('delivery.fields.assignedTo')}
        placeholder={t('delivery.form.selectAssignee')}
        data={employeeOptions}
        value={selectedEmployeeId}
        onChange={setSelectedEmployeeId}
        searchable
        required
        leftSection={<IconTruck size={16} />}
      />

      <DateInput
        label={t('delivery.fields.scheduledDate')}
        placeholder={t('delivery.form.selectDate')}
        value={scheduledDate}
        onChange={(date) => setScheduledDate(date ? new Date(date) : null)}
        required
        minDate={new Date()}
        leftSection={<IconCalendar size={16} />}
      />

      <Textarea
        label={t('delivery.fields.notes')}
        placeholder={t('delivery.form.enterNotes')}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        rows={3}
      />

      <Group justify="flex-end" gap="sm">
        <Button variant="light" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!selectedEmployeeId || !scheduledDate}
          leftSection={<IconTruck size={16} />}
        >
          {t('delivery.actions.create')}
        </Button>
      </Group>
    </Stack>
  );

  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        onTransitionEnd={() => {
          if (opened) handleOpen();
        }}
        title={t('delivery.actions.create')}
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
      onTransitionEnd={() => {
        if (opened) handleOpen();
      }}
      title={t('delivery.actions.create')}
      centered
      size="md"
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
