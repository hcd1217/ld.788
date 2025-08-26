import { Stack, Button, Checkbox, Group } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { DELIVERY_STATUS, type DeliveryStatusType } from '@/constants/deliveryRequest';

interface DeliveryStatusDrawerProps {
  readonly opened: boolean;
  readonly selectedStatuses: DeliveryStatusType[];
  readonly onClose: () => void;
  readonly onStatusToggle: (status: DeliveryStatusType) => void;
  readonly onApply: () => void;
  readonly onClear: () => void;
}

export function DeliveryStatusDrawer({
  opened,
  selectedStatuses,
  onClose,
  onStatusToggle,
  onApply,
  onClear,
}: DeliveryStatusDrawerProps) {
  const { t } = useTranslation();

  const statusOptions = [
    { value: DELIVERY_STATUS.PENDING, label: t('delivery.status.pending') },
    { value: DELIVERY_STATUS.IN_TRANSIT, label: t('delivery.status.inTransit') },
    { value: DELIVERY_STATUS.COMPLETED, label: t('delivery.status.completed') },
  ];

  const isAllSelected =
    selectedStatuses.length === 0 || selectedStatuses.includes(DELIVERY_STATUS.ALL);
  const selectedCount = isAllSelected ? 0 : selectedStatuses.length;

  const handleAllToggle = () => {
    onStatusToggle(DELIVERY_STATUS.ALL);
  };

  const handleStatusToggle = (status: DeliveryStatusType) => {
    onStatusToggle(status);
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      size="360px"
      title={
        selectedCount > 0 ? `${t('po.selectStatus')} (${selectedCount})` : t('po.selectStatus')
      }
      onClose={onClose}
    >
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
              checked={!isAllSelected && selectedStatuses.includes(option.value)}
              disabled={isAllSelected}
              onChange={() => handleStatusToggle(option.value)}
            />
          ))}
        </Stack>

        {/* Action buttons */}
        <Group grow mt="md">
          <Button variant="light" onClick={handleClear}>
            {t('common.clear')}
          </Button>
          <Button onClick={handleApply}>{t('common.apply')}</Button>
        </Group>
      </Stack>
    </Drawer>
  );
}
