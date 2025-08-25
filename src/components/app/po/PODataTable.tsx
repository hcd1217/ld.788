import React, { memo, useCallback } from 'react';
import { Table, Text, ScrollArea, Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import { POActions } from './POActions';
import { POStatusBadge } from './POStatusBadge';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPODetailRoute } from '@/config/routeConfig';
import { formatDate, getLocaleFormat } from '@/utils/time';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

type PODataTableProps = {
  readonly purchaseOrders: readonly PurchaseOrder[];
  readonly noAction?: boolean;
  readonly isLoading?: boolean;
  readonly onConfirmPO?: (po: PurchaseOrder) => void;
  readonly onProcessPO?: (po: PurchaseOrder) => void;
  readonly onShipPO?: (po: PurchaseOrder) => void;
  readonly onDeliverPO?: (po: PurchaseOrder) => void;
  readonly onCancelPO?: (po: PurchaseOrder) => void;
  readonly onRefundPO?: (po: PurchaseOrder) => void;
};

function PODataTableComponent({
  purchaseOrders,
  noAction = false,
  isLoading = false,
  onConfirmPO,
  onProcessPO,
  onShipPO,
  onDeliverPO,
  onCancelPO,
  onRefundPO,
}: PODataTableProps) {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  // Memoized navigation handler
  const handleRowClick = useCallback(
    (poId: string) => () => {
      navigate(getPODetailRoute(poId));
    },
    [navigate],
  );

  // Memoized stop propagation handler
  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Memoized action handlers
  const createActionHandler = useCallback(
    (actionFn: ((po: PurchaseOrder) => void) | undefined, po: PurchaseOrder) => {
      return actionFn ? () => actionFn(po) : undefined;
    },
    [],
  );

  const fmtDate = useCallback(
    (date: Date | string | undefined) => {
      return formatDate(date, getLocaleFormat(currentLanguage));
    },
    [currentLanguage],
  );

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
                onClick={handleRowClick(po.id)}
              >
                <Table.Td>
                  <Text fw={500}>{po.poNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" justify="start">
                    <Text fw={400}>
                      {getCustomerNameByCustomerId(customerMapByCustomerId, po.customerId)}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>{fmtDate(po.orderDate)}</Table.Td>
                <Table.Td>{po.deliveryDate ? fmtDate(po.deliveryDate) : '-'}</Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {po.items.length} {t('po.itemsCount')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <POStatusBadge status={po.status} />
                </Table.Td>
                {noAction ? null : (
                  <Table.Td onClick={handleStopPropagation}>
                    <POActions
                      purchaseOrderId={po.id}
                      status={po.status}
                      isLoading={isLoading}
                      onConfirm={createActionHandler(onConfirmPO, po)}
                      onProcess={createActionHandler(onProcessPO, po)}
                      onShip={createActionHandler(onShipPO, po)}
                      onDeliver={createActionHandler(onDeliverPO, po)}
                      onCancel={createActionHandler(onCancelPO, po)}
                      onRefund={createActionHandler(onRefundPO, po)}
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

export const PODataTable = memo(PODataTableComponent);
