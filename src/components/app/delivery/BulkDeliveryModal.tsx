import { useEffect, useState } from 'react';

import { Button, Group, Select, Stack, Switch, Textarea } from '@mantine/core';
import { IconCalendar, IconTruck, IconUrgent, IconX } from '@tabler/icons-react';

import { DateInput, ModalOrDrawer, UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeliveryAssigneeOptions } from '@/stores/useDeliveryRequestStore';

type BulkDeliveryModalProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly selectedCount: number;
  readonly onSubmit: (data: {
    assignedTo: string;
    scheduledDate: string;
    notes: string;
    isUrgentDelivery: boolean;
  }) => Promise<void>;
  readonly isLoading?: boolean;
};

export function BulkDeliveryModal({
  opened,
  onClose,
  selectedCount,
  onSubmit,
  isLoading = false,
}: BulkDeliveryModalProps) {
  const { t } = useTranslation();
  const assigneeOptions = useDeliveryAssigneeOptions();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isUrgentDelivery, setIsUrgentDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      setSelectedEmployeeId(null);
      setScheduledDate(undefined);
      setNotes('');
      setIsUrgentDelivery(false);
      setIsSubmitting(false);
    }
  }, [opened]);

  const handleSubmit = async () => {
    if (!selectedEmployeeId || !scheduledDate) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        assignedTo: selectedEmployeeId,
        scheduledDate: scheduledDate.toISOString(),
        notes: notes.trim(),
        isUrgentDelivery,
      });
      onClose();
    } catch {
      // Error handling done by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(selectedEmployeeId && scheduledDate);

  return (
    <ModalOrDrawer
      title={t('po.bulkDeliveryModalTitle', { count: selectedCount })}
      opened={opened}
      onClose={onClose}
      drawerSize="lg"
    >
      <Stack gap="md">
        {/* Assigned Driver */}
        <Select
          required
          label={t('delivery.assignedTo')}
          placeholder={t('delivery.form.selectAssignee')}
          data={assigneeOptions}
          value={selectedEmployeeId}
          onChange={setSelectedEmployeeId}
          searchable
          leftSection={<IconTruck size={16} />}
          disabled={isLoading || isSubmitting}
        />

        {/* Scheduled Date */}
        <DateInput
          required
          label={t('delivery.scheduledDate')}
          placeholder={t('delivery.form.selectDate')}
          value={scheduledDate}
          onChange={(date) => setScheduledDate(date ? new Date(date) : undefined)}
          minDate={new Date()}
          leftSection={<IconCalendar size={16} />}
          disabled={isLoading || isSubmitting}
        />

        {/* Notes */}
        <Textarea
          label={t('common.notes')}
          placeholder={t('delivery.form.enterNotes')}
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          rows={3}
          disabled={isLoading || isSubmitting}
        />

        {/* Urgent Delivery Switch */}
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
          disabled={isLoading || isSubmitting}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="light"
            onClick={onClose}
            disabled={isSubmitting}
            leftSection={<IconX size={16} />}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!isFormValid || isLoading}
            leftSection={<IconTruck size={16} />}
          >
            {t('po.createDeliveryRequests', { count: selectedCount })}
          </Button>
        </Group>
      </Stack>
    </ModalOrDrawer>
  );
}
