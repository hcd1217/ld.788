import React, { memo, useCallback } from 'react';
import { Table, Text, ScrollArea, Group } from '@mantine/core';
import { useNavigate } from 'react-router';
import { DeliveryStatusBadge } from './DeliveryStatusBadge';
import { UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { formatDate, getLocaleFormat } from '@/utils/time';
import { getEmployeeNameByEmployeeId } from '@/utils/overview';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';

type DeliveryDataTableProps = {
  readonly deliveryRequests: readonly DeliveryRequest[];
  readonly noAction?: boolean;
  readonly isLoading?: boolean;
};

function DeliveryDataTableComponent({
  deliveryRequests,
  noAction = false,
}: DeliveryDataTableProps) {
  const { t, currentLanguage } = useTranslation();
  const navigate = useNavigate();

  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();

  // Memoized navigation handler
  const handleRowClick = useCallback(
    (deliveryId: string) => () => {
      navigate(`/delivery/${deliveryId}`);
    },
    [navigate],
  );

  // Memoized stop propagation handler
  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const fmtDate = useCallback(
    (date: Date | string | undefined) => {
      return formatDate(date, getLocaleFormat(currentLanguage));
    },
    [currentLanguage],
  );

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('delivery.title') as string}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('delivery.id')}</Table.Th>
            <Table.Th>{t('delivery.customer')}</Table.Th>
            <Table.Th>{t('delivery.scheduledDate')}</Table.Th>
            <Table.Th>{t('delivery.completedDate')}</Table.Th>
            <Table.Th>{t('delivery.assignedTo')}</Table.Th>
            <Table.Th>{t('delivery.status')}</Table.Th>
            {!noAction && <Table.Th style={{ width: 120 }}>{t('common.actions')}</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {deliveryRequests.map((delivery) => {
            return (
              <Table.Tr
                key={delivery.id}
                style={{
                  cursor: 'pointer',
                  backgroundColor: delivery.isUrgentDelivery
                    ? 'var(--mantine-color-red-0)'
                    : undefined,
                }}
                onClick={handleRowClick(delivery.id)}
              >
                <Table.Td>
                  <Text fw={500}>{delivery.deliveryRequestNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm" justify="start">
                    <Text fw={400}>{delivery.customerName}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{fmtDate(delivery.scheduledDate)}</Table.Td>
                <Table.Td>
                  {delivery.completedDate ? fmtDate(delivery.completedDate) : '-'}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {getEmployeeNameByEmployeeId(employeeMapByEmployeeId, delivery.assignedTo)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {delivery.isUrgentDelivery && <UrgentBadge size="xs" />}
                    <DeliveryStatusBadge status={delivery.status} />
                  </Group>
                </Table.Td>
                {!noAction && (
                  <Table.Td onClick={handleStopPropagation}>
                    {/* TODO: Add delivery actions component */}
                    <Text size="sm" c="dimmed">
                      Actions
                    </Text>
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

export const DeliveryDataTable = memo(DeliveryDataTableComponent);
