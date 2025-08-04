import { SimpleGrid, Button } from '@mantine/core';
import { Drawer } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import { PO_STATUS } from '@/constants/purchaseOrder';

interface POStatusDrawerProps {
  readonly opened: boolean;
  readonly selectedStatus: (typeof PO_STATUS)[keyof typeof PO_STATUS];
  readonly onClose: () => void;
  readonly onStatusSelect: (status: (typeof PO_STATUS)[keyof typeof PO_STATUS]) => void;
}

export function POStatusDrawer({
  opened,
  selectedStatus,
  onClose,
  onStatusSelect,
}: POStatusDrawerProps) {
  const { t } = useTranslation();

  const handleStatusSelect = (status: (typeof PO_STATUS)[keyof typeof PO_STATUS]) => {
    onStatusSelect(status);
    onClose();
  };

  const statusOptions = [
    { value: PO_STATUS.ALL, label: t('po.allStatus') },
    { value: PO_STATUS.NEW, label: t('po.status.NEW') },
    { value: PO_STATUS.CONFIRMED, label: t('po.status.CONFIRMED') },
    { value: PO_STATUS.PROCESSING, label: t('po.status.PROCESSING') },
    { value: PO_STATUS.SHIPPED, label: t('po.status.SHIPPED') },
    { value: PO_STATUS.DELIVERED, label: t('po.status.DELIVERED') },
    { value: PO_STATUS.CANCELLED, label: t('po.status.CANCELLED') },
    { value: PO_STATUS.REFUNDED, label: t('po.status.REFUNDED') },
  ];

  // Calculate drawer height based on number of items
  const calculateDrawerHeight = () => {
    const itemCount = statusOptions.length;
    const rows = Math.ceil(itemCount / 2);
    const buttonHeight = 36;
    const gapHeight = 8;
    const padding = 32;
    const headerHeight = 60;
    const calculatedHeight = headerHeight + padding + rows * buttonHeight + (rows - 1) * gapHeight;
    return `${Math.min(calculatedHeight, 400)}px`; // Max height 400px
  };

  return (
    <Drawer
      opened={opened}
      size={calculateDrawerHeight()}
      title={t('po.selectStatus')}
      onClose={onClose}
    >
      <SimpleGrid cols={2} spacing="xs">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedStatus === option.value ? 'filled' : 'light'}
            onClick={() => handleStatusSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </SimpleGrid>
    </Drawer>
  );
}
