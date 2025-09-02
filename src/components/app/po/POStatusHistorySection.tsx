import { Grid, Text } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/utils/time';
import { getEmployeeNameByUserId } from '@/utils/overview';
import { useEmployeeMapByUserId } from '@/stores/useAppStore';
import { getStatusHistoryByStatus } from '@/utils/purchaseOrder';
import type { PurchaseOrder, POStatus } from '@/services/sales/purchaseOrder';

type POStatusHistorySectionProps = {
  readonly purchaseOrder: PurchaseOrder;
};

const span = { base: 12, md: 6 };

const statusesToShow = [
  { status: 'NEW' as POStatus, label: 'createdBy' },
  { status: 'CONFIRMED' as POStatus, label: 'confirmedBy' },
  { status: 'PROCESSING' as POStatus, label: 'processedBy' },
  { status: 'SHIPPED' as POStatus, label: 'shippedBy' },
  { status: 'DELIVERED' as POStatus, label: 'deliveredBy' },
];

export function POStatusHistorySection({ purchaseOrder }: POStatusHistorySectionProps) {
  const { t } = useTranslation();
  const employeeMapByUserId = useEmployeeMapByUserId();

  return (
    <Grid>
      {statusesToShow.map(({ status, label }) => {
        const entry = getStatusHistoryByStatus(purchaseOrder.statusHistory, status);
        if (!entry) return null;

        return (
          <Grid.Col key={status} span={span}>
            <div>
              <Text size="sm" fw={500} c="dimmed">
                {t(`po.${label}` as any)}
              </Text>
              <Text>{getEmployeeNameByUserId(employeeMapByUserId, entry.userId)}</Text>
              <Text size="xs" c="dimmed">
                {formatDateTime(entry.timestamp)}
              </Text>
            </div>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
