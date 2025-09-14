import { memo, useCallback } from 'react';

import { useNavigate } from 'react-router';

import { Group, ScrollArea, Table, Text } from '@mantine/core';

import { UrgentBadge } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { useEmployeeMapByEmployeeId } from '@/stores/useAppStore';
import { getEmployeeNameByEmployeeId } from '@/utils/overview';
import { formatDate } from '@/utils/time';

import { DeliveryStatusBadge } from './DeliveryStatusBadge';

type DeliveryDataTableProps = {
  readonly deliveryRequests: readonly DeliveryRequest[];
  readonly isLoading?: boolean;
};

function DeliveryDataTableComponent({ deliveryRequests }: DeliveryDataTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const employeeMapByEmployeeId = useEmployeeMapByEmployeeId();

  // Memoized navigation handler
  const handleRowClick = useCallback(
    (deliveryId: string) => () => {
      navigate(`/delivery/${deliveryId}`);
    },
    [navigate],
  );

  return (
    <ScrollArea>
      <Table striped highlightOnHover aria-label={t('delivery.list.title') as string}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('delivery.id')}</Table.Th>
            <Table.Th>{t('delivery.customer')}</Table.Th>
            <Table.Th>{t('delivery.scheduledDate')}</Table.Th>
            <Table.Th>{t('delivery.completedDate')}</Table.Th>
            <Table.Th>{t('delivery.assignedTo')}</Table.Th>
            <Table.Th>{t('delivery.status')}</Table.Th>
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
                <Table.Td>{formatDate(delivery.scheduledDate)}</Table.Td>
                <Table.Td>
                  {delivery.completedDate ? formatDate(delivery.completedDate) : '-'}
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
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export const DeliveryDataTable = memo(DeliveryDataTableComponent);
