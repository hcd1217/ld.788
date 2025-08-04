import { Table, Text, ScrollArea, Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import { POActions } from './POActions';
import { POStatusBadge } from './POStatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPODetailRoute } from '@/config/routeConfig';
import { formatDate } from '@/utils/time';
import { formatCurrency } from '@/utils/number';

type PODataTableProps = {
  readonly purchaseOrders: readonly PurchaseOrder[];
  readonly noAction?: boolean;
  readonly onConfirmPO?: (po: PurchaseOrder) => void;
  readonly onProcessPO?: (po: PurchaseOrder) => void;
  readonly onShipPO?: (po: PurchaseOrder) => void;
  readonly onDeliverPO?: (po: PurchaseOrder) => void;
  readonly onCancelPO?: (po: PurchaseOrder) => void;
  readonly onRefundPO?: (po: PurchaseOrder) => void;
};

export function PODataTable({
  purchaseOrders,
  noAction = false,
  onConfirmPO,
  onProcessPO,
  onShipPO,
  onDeliverPO,
  onCancelPO,
  onRefundPO,
}: PODataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('po.tableAriaLabel')}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('po.poNumber')}</Table.Th>
            <Table.Th>{t('po.customer')}</Table.Th>
            <Table.Th>{t('po.orderDate')}</Table.Th>
            <Table.Th>{t('po.deliveryDate')}</Table.Th>
            <Table.Th>{t('po.items')}</Table.Th>
            <Table.Th>{t('po.total')}</Table.Th>
            <Table.Th>{t('po.paymentTerms')}</Table.Th>
            <Table.Th>{t('po.poStatus')}</Table.Th>
            {noAction ? null : <Table.Th style={{ width: 120 }}>{t('common.actions')}</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {purchaseOrders.map((po) => {
            return (
              <Table.Tr
                key={po.id}
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => navigate(getPODetailRoute(po.id))}
              >
                <Table.Td>
                  <Text fw={500}>{po.poNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" justify="start">
                    <Text fw={400}>{po.customer?.name ?? '-'}</Text>
                    {po.customer?.companyName ? (
                      <Text c="dimmed" size="sm">
                        ({po.customer.companyName})
                      </Text>
                    ) : null}
                  </Group>
                </Table.Td>
                <Table.Td>{formatDate(po.orderDate)}</Table.Td>
                <Table.Td>{po.deliveryDate ? formatDate(po.deliveryDate) : '-'}</Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {po.items.length} {t('po.itemsCount')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{formatCurrency(po.totalAmount)}</Text>
                </Table.Td>
                <Table.Td>{po.paymentTerms ?? '-'}</Table.Td>
                <Table.Td>
                  <POStatusBadge status={po.status} />
                </Table.Td>
                {noAction ? null : (
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <POActions
                      purchaseOrderId={po.id}
                      status={po.status}
                      onConfirm={
                        onConfirmPO
                          ? () => {
                              onConfirmPO(po);
                            }
                          : undefined
                      }
                      onProcess={
                        onProcessPO
                          ? () => {
                              onProcessPO(po);
                            }
                          : undefined
                      }
                      onShip={
                        onShipPO
                          ? () => {
                              onShipPO(po);
                            }
                          : undefined
                      }
                      onDeliver={
                        onDeliverPO
                          ? () => {
                              onDeliverPO(po);
                            }
                          : undefined
                      }
                      onCancel={
                        onCancelPO
                          ? () => {
                              onCancelPO(po);
                            }
                          : undefined
                      }
                      onRefund={
                        onRefundPO
                          ? () => {
                              onRefundPO(po);
                            }
                          : undefined
                      }
                    />
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
