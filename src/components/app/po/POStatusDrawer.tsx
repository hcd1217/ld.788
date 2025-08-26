import { Stack, Button, Checkbox, Group } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { PO_STATUS, type POStatusType } from '@/constants/purchaseOrder';

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

  const statusOptions = [
    { value: PO_STATUS.NEW, label: t('po.status.NEW') },
    { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
    { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
    { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
    { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
    { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
    { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
  ];

  const isAllSelected = selectedStatuses.length === 0 || selectedStatuses.includes(PO_STATUS.ALL);
  const selectedCount = isAllSelected ? 0 : selectedStatuses.length;

  const handleAllToggle = () => {
    onStatusToggle(PO_STATUS.ALL);
  };

  const handleStatusToggle = (status: POStatusType) => {
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
