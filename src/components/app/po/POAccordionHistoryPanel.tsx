import { Group, Stack, Text } from '@mantine/core';
import {
  IconCheck,
  IconFileInvoice,
  IconPackage,
  IconPackageExport,
  IconReceipt,
  IconTruck,
  IconX,
} from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import type { POStatus, PurchaseOrder } from '@/services/sales/purchaseOrder';
import { useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getEmployeeNameByUserId } from '@/utils/overview';
import { getStatusHistoryByStatus } from '@/utils/purchaseOrder';
import { formatDateTime } from '@/utils/time';

// Status history display configuration
const STATUS_HISTORY_CONFIG = [
  {
    status: 'NEW' as POStatus,
    icon: IconFileInvoice,
    color: 'gray',
    labelKey: 'createdBy',
  },
  {
    status: 'CONFIRMED' as POStatus,
    icon: IconCheck,
    color: 'green',
    labelKey: 'confirmedBy',
  },
  {
    status: 'PROCESSING' as POStatus,
    icon: IconPackage,
    color: 'blue',
    labelKey: 'processedBy',
  },
  {
    status: 'SHIPPED' as POStatus,
    icon: IconTruck,
    color: 'indigo',
    labelKey: 'shippedBy',
  },
  {
    status: 'DELIVERED' as POStatus,
    icon: IconPackageExport,
    color: 'green',
    labelKey: 'deliveredBy',
  },
  {
    status: 'CANCELLED' as POStatus,
    icon: IconX,
    color: 'red',
    labelKey: 'cancelledBy',
  },
  {
    status: 'REFUNDED' as POStatus,
    icon: IconReceipt,
    color: 'orange',
    labelKey: 'refundedBy',
  },
];

type POAccordionHistoryPanelProps = {
  readonly purchaseOrder: PurchaseOrder;
};

export function POAccordionHistoryPanel({ purchaseOrder }: POAccordionHistoryPanelProps) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();

  if (!purchaseOrder.statusHistory || purchaseOrder.statusHistory.length === 0) {
    return null;
  }

  return (
    <Stack gap="xs">
      {STATUS_HISTORY_CONFIG.map(({ status, icon: Icon, color, labelKey }) => {
        const entry = getStatusHistoryByStatus(purchaseOrder.statusHistory, status);
        if (!entry) return null;

        return (
          <Group key={status} gap="xs" align="flex-start">
            <Icon size={16} color={`var(--mantine-color-${color}-6)`} />
            <div style={{ flex: 1 }}>
              <Text size="xs" c="dimmed">
                {t(`po.${labelKey}` as any)}:
              </Text>
              <Text size="sm">{getEmployeeNameByUserId(employeeMapByUserId, entry.userId)}</Text>
              <Text size="xs" c="dimmed">
                {formatDateTime(entry.timestamp)}
              </Text>
            </div>
          </Group>
        );
      })}
    </Stack>
  );
}
