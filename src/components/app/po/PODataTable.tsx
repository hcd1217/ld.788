import { memo, useCallback } from 'react';

import { useNavigate } from 'react-router';

import { Checkbox, Group, ScrollArea, Table, Text } from '@mantine/core';

import { getPODetailRoute } from '@/config/routeConfig';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';

import { PODeliveryBadge } from './PODeliveryBadge';
import { POStatusBadge } from './POStatusBadge';
import { POTags } from './POTags';
import { POUrgentBadge } from './POUrgentBadge';

type PODataTableProps = {
  readonly purchaseOrders: readonly PurchaseOrder[];
  readonly noAction?: boolean;
  readonly isLoading?: boolean;
  readonly onConfirmPO?: (po: PurchaseOrder) => void;
  readonly onProcessPO?: (po: PurchaseOrder) => void;
  readonly onMarkReadyPO?: (po: PurchaseOrder) => void;
  readonly onShipPO?: (po: PurchaseOrder) => void;
  readonly onDeliverPO?: (po: PurchaseOrder) => void;
  readonly onCancelPO?: (po: PurchaseOrder) => void;
  readonly onRefundPO?: (po: PurchaseOrder) => void;
  readonly selectionMode?: boolean;
  readonly selectedPOIds?: readonly string[];
  readonly onSelectionChange?: (selectedIds: string[]) => void;
};

function PODataTableComponent({
  purchaseOrders,
  selectionMode = false,
  selectedPOIds = [],
  onSelectionChange,
}: PODataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Memoized navigation handler
  const handleRowClick = useCallback(
    (poId: string) => () => {
      navigate(getPODetailRoute(poId));
    },
    [navigate],
  );

  // Selection handlers
  const handleSelectPO = useCallback(
    (poId: string, checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        onSelectionChange([...selectedPOIds, poId]);
      } else {
        onSelectionChange(selectedPOIds.filter((id) => id !== poId));
      }
    },
    [selectedPOIds, onSelectionChange],
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        // Only select eligible POs (READY_FOR_PICKUP + isInternalDelivery + no existing delivery)
        const eligiblePOIds = purchaseOrders
          .filter((po) => {
            return po.status === 'READY_FOR_PICKUP' && po.isInternalDelivery && !po.deliveryRequest;
          })
          .map((po) => po.id);
        onSelectionChange(eligiblePOIds);
      } else {
        onSelectionChange([]);
      }
    },
    [purchaseOrders, onSelectionChange],
  );

  // Check if PO is eligible for delivery creation
  const isPOEligible = useCallback((po: PurchaseOrder) => {
    return po.status === 'READY_FOR_PICKUP' && po.isInternalDelivery && !po.deliveryRequest;
  }, []);

  const allEligibleSelected = purchaseOrders
    .filter(isPOEligible)
    .every((po) => selectedPOIds.includes(po.id));

  const someEligibleSelected = purchaseOrders
    .filter(isPOEligible)
    .some((po) => selectedPOIds.includes(po.id));

  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            {selectionMode && (
              <Table.Th style={{ width: '40px' }}>
                <Checkbox
                  checked={allEligibleSelected}
                  indeterminate={someEligibleSelected && !allEligibleSelected}
                  onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                  aria-label={t('po.selectAll')}
                />
              </Table.Th>
            )}
            <Table.Th>#</Table.Th>
            <Table.Th>{t('po.poNumber')}</Table.Th>
            <Table.Th>{t('common.customer')}</Table.Th>
            <Table.Th>{t('po.salesPerson')}</Table.Th>
            <Table.Th>{t('po.orderDate')}</Table.Th>
            <Table.Th>{t('po.deliveryDate')}</Table.Th>
            <Table.Th>{t('po.items')}</Table.Th>
            <Table.Th w="150px">{t('po.poStatus')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {purchaseOrders.map((po, index) => {
            const isEligible = isPOEligible(po);
            const isSelected = selectedPOIds.includes(po.id);
            return (
              <Table.Tr
                key={po.id}
                style={{
                  cursor: 'pointer',
                }}
                bg={po.isUrgentPO ? 'var(--mantine-color-red-1)' : undefined}
                onClick={selectionMode ? undefined : handleRowClick(po.id)}
              >
                {selectionMode && (
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      disabled={!isEligible}
                      onChange={(e) => handleSelectPO(po.id, e.currentTarget.checked)}
                      aria-label={t('po.selectPO', { poNumber: po.poNumber })}
                    />
                  </Table.Td>
                )}
                <Table.Td>
                  <Text fw={500}>{index + 1}</Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>{po.poNumber}</Text>
                  {po.customerPONumber ? (
                    <Text size="sm" c="dimmed">
                      {' '}
                      ({po.customerPONumber})
                    </Text>
                  ) : (
                    <></>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" justify="start">
                    <Text fw={400}>{po.customerName ?? '-'}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{po.salesPerson}</Text>
                </Table.Td>
                <Table.Td>{formatDate(po.orderDate)}</Table.Td>
                <Table.Td>{formatDate(po.deliveryDate)}</Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {po.items.length} {t('po.itemsCount')}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" m={0} mb="xs" justify="space-between">
                    <POStatusBadge status={po.status} />
                    <PODeliveryBadge isInternalDelivery={po.isInternalDelivery} />
                    <POUrgentBadge isUrgentPO={po.isUrgentPO} />
                  </Group>
                  <POTags tags={po.poTags} size="xs" />
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export const PODataTable = memo(PODataTableComponent);
