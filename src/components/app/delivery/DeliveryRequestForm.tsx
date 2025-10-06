import { useMemo, useState } from 'react';

import {
  Alert,
  Button,
  Group,
  MultiSelect,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@mantine/core';
import { IconCalendar, IconPackage, IconTruck, IconUrgent } from '@tabler/icons-react';

import { DateInput, UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { useCustomerOptions } from '@/stores/useAppStore';
import { useDeliveryAssigneeOptions } from '@/stores/useDeliveryRequestStore';
import { usePOActions, usePOLoading, usePurchaseOrderList } from '@/stores/usePOStore';
import { formatShortDate } from '@/utils/time';

type DeliveryRequestFormProps = {
  readonly onSuccess: () => void;
  readonly onClose: () => void;
  readonly onSubmit: (data: {
    purchaseOrderIds: string[];
    assignedTo: string;
    scheduledDate: string;
    notes: string;
    isUrgentDelivery: boolean;
  }) => Promise<void>;
};

export function DeliveryRequestForm({ onSuccess, onClose, onSubmit }: DeliveryRequestFormProps) {
  const { t } = useTranslation();
  const customerOptions = useCustomerOptions();
  const assigneeOptions = useDeliveryAssigneeOptions();
  const { loadPOsWithFilter } = usePOActions();
  const purchaseOrders = usePurchaseOrderList();
  const isPOLoading = usePOLoading();

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedPOIds, setSelectedPOIds] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isUrgentDelivery, setIsUrgentDelivery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posLoaded, setPosLoaded] = useState(false);

  // Filter POs: isInternalDelivery=true AND no existing delivery request
  const filteredPOOptions = useMemo(() => {
    return purchaseOrders
      .filter((po) => {
        // Must be internal delivery
        if (!po.isInternalDelivery) return false;
        // Must not have existing delivery request
        if (po.deliveryRequest) return false;
        return true;
      })
      .map((po) => {
        let label = po.poNumber;
        if (po.customerPONumber) {
          label += ` (${po.customerPONumber})`;
        }
        if (po.deliveryDate) {
          label += ` (${t('common.date')}: ${formatShortDate(po.deliveryDate)})`;
        }
        return { value: po.id, label };
      });
  }, [t, purchaseOrders]);

  // Handle load POs
  const handleLoadPOs = async () => {
    if (!selectedCustomerId) return;

    try {
      await loadPOsWithFilter(
        {
          customerId: selectedCustomerId,
          statuses: ['READY_FOR_PICKUP'], // Only ready-for-pickup POs (BE filter)
        },
        true,
      );
      setPosLoaded(true);
    } catch {
      // Error handled by store
    }
  };

  // Handle form submission - create delivery requests for all selected POs
  const handleSubmit = async () => {
    if (!selectedEmployeeId || !scheduledDate || selectedPOIds.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        purchaseOrderIds: selectedPOIds,
        assignedTo: selectedEmployeeId,
        scheduledDate: scheduledDate.toISOString(),
        notes: notes.trim(),
        isUrgentDelivery,
      });
      onSuccess();
    } catch {
      // Error handling done by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(selectedEmployeeId && scheduledDate && selectedPOIds.length > 0);

  return (
    <Stack gap="md">
      {/* Info Alert */}
      <Alert
        icon={<IconPackage size={20} />}
        title={t('delivery.types.delivery')}
        color="blue"
        variant="light"
      >
        <Text size="sm">{t('delivery.createDeliveryDescription')}</Text>
      </Alert>

      {/* Customer Select */}
      <Select
        required
        label={t('common.customer')}
        placeholder={t('delivery.form.selectCustomer')}
        data={customerOptions}
        value={selectedCustomerId}
        onChange={(value) => {
          setSelectedCustomerId(value);
          setSelectedPOIds([]);
          setPosLoaded(false);
        }}
        searchable
        disabled={isSubmitting}
      />

      {/* Load POs Button */}
      {selectedCustomerId && !posLoaded && (
        <Button
          onClick={handleLoadPOs}
          loading={isPOLoading}
          disabled={isSubmitting}
          variant="light"
          leftSection={<IconPackage size={16} />}
        >
          {t('po.actions.loadPOs')}
        </Button>
      )}

      {/* PO Select (shown after loading) */}
      {posLoaded && (
        <MultiSelect
          required
          label={t('delivery.purchaseOrders')}
          placeholder={t('delivery.form.selectPOs')}
          description={t('delivery.form.selectPOsDescription')}
          data={filteredPOOptions}
          value={selectedPOIds}
          onChange={setSelectedPOIds}
          searchable
          disabled={isSubmitting}
          leftSection={<IconPackage size={16} />}
        />
      )}

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
        disabled={isSubmitting}
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
        disabled={isSubmitting}
      />

      {/* Notes */}
      <Textarea
        label={t('common.notes')}
        placeholder={t('delivery.form.enterNotes')}
        value={notes}
        onChange={(e) => setNotes(e.currentTarget.value)}
        rows={3}
        disabled={isSubmitting}
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
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
      <Group justify="flex-end" gap="sm" mt="md">
        <Button variant="light" onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!isFormValid}
          leftSection={<IconTruck size={16} />}
        >
          {t('delivery.actions.create')}
        </Button>
      </Group>
    </Stack>
  );
}
