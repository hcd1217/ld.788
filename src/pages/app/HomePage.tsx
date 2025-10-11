import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Collapse,
  Container,
  Group,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

import { AppDesktopLayout, AppMobileLayout, UrgentBadge } from '@/components/common';
import { DeliveryStatusBadge } from '@/components/app/delivery/DeliveryStatusBadge';
import { POStatusBadge } from '@/components/app/po/POStatusBadge';
import { getDeliveryDetailRoute, getPODetailRoute, ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest, PurchaseOrder } from '@/services/sales';
import { homeService } from '@/services/sales';
import { useMe, usePermissions } from '@/stores/useAppStore';
import { canViewAllDeliveryRequest, canViewAllPurchaseOrder, canViewDeliveryRequest, canViewPurchaseOrder } from '@/utils/permission.utils';
import { DeliveryTypeBadge } from '@/components/app/delivery/DeliveryTypeBadge';

export function HomePage() {
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const permissions = usePermissions();
  const currentUser = useMe();

  // Permission checks
  const { canViewPO, canViewDR, canViewWarehouse, canViewAllPO, canViewAllDR, canViewMyPO, canViewMyDR } = useMemo(
    () => {
      const canViewAllDR = canViewAllDeliveryRequest(permissions);
      const canViewMyDR = canViewDeliveryRequest(permissions);
      const canViewAllPO = canViewAllPurchaseOrder(permissions);
      const canViewMyPO = canViewPurchaseOrder(permissions);
      return {
        canViewPO: canViewAllPO || canViewMyPO,
        canViewDR: canViewAllDR || canViewMyDR,
        canViewWarehouse: canViewAllPO || canViewMyPO,
        canViewAllPO,
        canViewAllDR,
        canViewMyDR,
        canViewMyPO,
      };
    },
    [permissions],
  );

  // Collapsible state for mobile sections
  const [salesOpen, setSalesOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [warehouseOpen, setWarehouseOpen] = useState(false);

  useEffect(() => {
    if (canViewPO) {
      setSalesOpen(true);
    }
    if (canViewDR && !canViewPO) {
      setDeliveryOpen(true);
    }
  }, [canViewPO, canViewDR]);

  // Data state
  const [activePOs, setActivePOs] = useState<PurchaseOrder[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState<DeliveryRequest[]>([]);
  const [processingQueue, setProcessingQueue] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const renderPoNumber = useCallback((po: PurchaseOrder) => {
    return (<Text size="sm" fw={500}>
      {po.poNumber}
      {po.customerPONumber && (
        <Text size="sm" ml="xs">
          ({po.customerPONumber})
        </Text>
      )}
    </Text>)
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        const [activePOsData, todayDeliveriesData, processingQueueData] = await Promise.all([
          homeService.getActivePurchaseOrders(),
          homeService.getTodayDeliveryRequests(),
          homeService.getProcessingQueue(),
        ]);
        setActivePOs(activePOsData);
        setTodayDeliveries(todayDeliveriesData);
        setProcessingQueue(processingQueueData);
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboardData();
  }, []);

  // Filtered data based on permissions
  const filteredActivePOs = useMemo(() => {
    if (canViewAllPO) {
      return activePOs;
    }
    if (canViewMyPO && currentUser?.employee?.id) {
      return activePOs.filter((po) => po.salesId === currentUser.employee?.id);
    }
    return [];
  }, [activePOs, canViewAllPO, canViewMyPO, currentUser?.employee?.id]);

  const filteredTodayDeliveries = useMemo(() => {
    if (canViewAllDR) {
      return todayDeliveries;
    }
    if (canViewMyDR && currentUser?.employee?.id) {
      return todayDeliveries.filter((deliveryRequest) => deliveryRequest.assignedTo === currentUser.employee?.id);
    }
    return [];
  }, [todayDeliveries, canViewAllDR, canViewMyDR, currentUser?.employee?.id]);

  const filteredProcessingQueue = useMemo(() => {
    if (canViewAllPO) {
      return processingQueue;
    }
    if (canViewMyPO && currentUser?.employee?.id) {
      return processingQueue.filter((po) => po.salesId === currentUser.employee?.id);
    }
    return [];
  }, [processingQueue, canViewAllPO, canViewMyPO, currentUser?.employee?.id]);

  const clearError = () => {
    setError(undefined);
  };

  // Navigation handlers
  const handlePOClick = (poId: string) => {
    navigate(getPODetailRoute(poId));
  };

  const handleDRClick = (drId: string) => {
    navigate(getDeliveryDetailRoute(drId));
  };

  if (isMobile) {
    return (
      <AppMobileLayout isLoading={isLoading} error={error} clearError={clearError}>
        <Container fluid m="xs" px={0}>
          <Stack gap="xs">
            {/* Sales Section */}
            {canViewPO && (<Card shadow="sm" padding="lg">
              <Group
                justify="space-between"
                mb="md"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSalesOpen(!salesOpen);
                }}
              >
                <Group gap="xs">
                  <Title
                    order={3}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTERS.PO_MANAGEMENT);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {t('home.sales.sectionTitle')}
                  </Title>
                  {(canViewAllPO || canViewMyPO) && <Badge color="blue" variant="filled">
                    {filteredActivePOs.length}
                  </Badge>}
                </Group>
                <ActionIcon variant="subtle" color="gray">
                  {salesOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
              <Collapse in={salesOpen}>
                <Stack gap="xs">
                  {!(canViewAllPO || canViewMyPO) ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : filteredActivePOs.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      {t('po.noPOsFound')}
                    </Text>
                  ) : (
                    filteredActivePOs.slice(0, 5).map((po) => (
                      <Card
                        key={po.id}
                        padding="sm"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handlePOClick(po.id);
                        }}
                      >
                        <Group justify="space-between">
                          <Stack gap={4} style={{ position: 'relative' }}>
                            {renderPoNumber(po)}
                            <Text size="sm">
                              {po.customerName ?? '-'}
                            </Text>
                            <Group gap="xs">
                              <Text size="sm">
                                {po.salesPerson ?? '-'}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {new Date(po.orderDate).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Stack>
                          <Box style={{ position: 'absolute', top: 5, right: 5 }}>
                            <POStatusBadge status={po.status} />
                          </Box>
                        </Group>
                      </Card>
                    ))
                  )}
                </Stack>
              </Collapse>
            </Card>)}

            {/* Delivery Section */}
            {canViewDR && (<Card shadow="sm" padding="lg">
              <Group
                justify="space-between"
                mb="md"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setDeliveryOpen(!deliveryOpen);
                }}
              >
                <Group gap="xs">
                  <Title
                    order={3}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTERS.DELIVERY_MANAGEMENT);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {t('home.delivery.sectionTitle')}
                  </Title>
                  {(canViewAllDR || canViewMyDR) && <Badge color="orange" variant="filled">
                    {filteredTodayDeliveries.length}
                  </Badge>}
                </Group>
                <ActionIcon variant="subtle" color="gray">
                  {deliveryOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
              <Collapse in={deliveryOpen}>
                <Stack gap="xs">
                  {!(canViewAllDR || canViewMyDR) ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : filteredTodayDeliveries.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      {t('delivery.noDeliveryRequestsFound')}
                    </Text>
                  ) : (
                    filteredTodayDeliveries.map((deliveryRequest) => (
                      <Card
                        key={deliveryRequest.id}
                        padding="sm"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handleDRClick(deliveryRequest.id);
                        }}
                      >
                        <Group justify="space-between">
                          <Stack gap={4}>
                            <Group gap="xs">
                              <Text fw={500}>{deliveryRequest.deliveryRequestNumber}</Text>
                            </Group>
                            <Group gap="xs">
                              <Text size="sm" c="dimmed">
                                {deliveryRequest.customerName ? t('common.customer') : t('common.vendor')}:
                              </Text>
                              <Text size="sm">
                                {deliveryRequest.customerName || deliveryRequest.vendorName || '-'}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Text size="sm" c="dimmed">
                                {t('delivery.assignedTo')}:
                              </Text>
                              <Text size="sm">
                                {deliveryRequest.deliveryPerson ?? '-'}
                              </Text>
                            </Group>

                          </Stack>
                          <Group gap="xs">
                            {deliveryRequest.isUrgentDelivery && <UrgentBadge size="xs" />}
                            <DeliveryStatusBadge status={deliveryRequest.status} />
                            <DeliveryTypeBadge type={deliveryRequest.type} size="xs" />
                          </Group>
                        </Group>
                      </Card>
                    ))
                  )}
                </Stack>
              </Collapse>
            </Card>)}

            {/* Warehouse Section */}
            {canViewWarehouse && (<Card shadow="sm" padding="lg">
              <Group
                justify="space-between"
                mb="md"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setWarehouseOpen(!warehouseOpen);
                }}
              >
                <Group gap="xs">
                  <Title
                    order={3}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(ROUTERS.PO_MANAGEMENT);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {t('home.warehouse.sectionTitle')}
                  </Title>
                  {(canViewAllPO || canViewMyPO) && <Badge color="teal" variant="filled">
                    {filteredProcessingQueue.length}
                  </Badge>}
                </Group>
                <ActionIcon variant="subtle" color="gray">
                  {warehouseOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
              <Collapse in={warehouseOpen}>
                <Stack gap="xs">
                  {!(canViewAllPO || canViewMyPO) ? (
                    <Text c="dimmed" size="sm">
                      -
                    </Text>
                  ) : filteredProcessingQueue.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      {t('po.noPOsFound')}
                    </Text>
                  ) : (
                    filteredProcessingQueue.slice(0, 5).map((po) => (
                      <Card
                        key={po.id}
                        padding="sm"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          handlePOClick(po.id);
                        }}
                      >
                        <Group justify="space-between">
                          <Stack gap={4} style={{ position: 'relative' }}>
                            {renderPoNumber(po)}
                            <Text size="sm">
                              {po.customerName ?? '-'}
                            </Text>
                            <Group gap="xs">
                              <Text size="sm">
                                {po.salesPerson ?? '-'}
                              </Text>
                              <Text size="sm" c="dimmed">
                                {new Date(po.orderDate).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Stack>
                          <Box style={{ position: 'absolute', top: 5, right: 5 }}>
                            <POStatusBadge status={po.status} />
                          </Box>
                        </Group>
                      </Card>
                    ))
                  )}
                </Stack>
              </Collapse>
            </Card>)}
          </Stack>
        </Container>
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <Container fluid px="xl">
        <Stack gap="xl">
          {/* Sales Section */}
          <Card shadow="sm" padding="lg">
            <Group justify="space-between" mb="md">
              <Title
                order={3}
                onClick={() => {
                  navigate(ROUTERS.PO_MANAGEMENT);
                }}
                style={{ cursor: 'pointer' }}
              >
                {t('home.sales.sectionTitle')}
              </Title>
              {(canViewAllPO || canViewMyPO) && <Badge color="blue" variant="filled" size="lg">
                {filteredActivePOs.length}
              </Badge>}
            </Group>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('home.sales.columns.poNumber')}</Table.Th>
                  <Table.Th>{t('home.sales.columns.customer')}</Table.Th>
                  <Table.Th>{t('po.salesPerson')}</Table.Th>
                  <Table.Th>{t('home.sales.columns.status')}</Table.Th>
                  <Table.Th>{t('home.sales.columns.orderDate')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!(canViewAllPO || canViewMyPO) ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('common.noPermission')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredActivePOs.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('po.noPOsFound')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredActivePOs.slice(0, 5).map((po) => (
                    <Table.Tr
                      key={po.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        handlePOClick(po.id);
                      }}
                    >
                      <Table.Td>
                        {renderPoNumber(po)}
                      </Table.Td>
                      <Table.Td>{po.customerName ?? '-'}</Table.Td>
                      <Table.Td>{po.salesPerson ?? '-'}</Table.Td>
                      <Table.Td>
                        <POStatusBadge status={po.status} />
                      </Table.Td>
                      <Table.Td>{new Date(po.orderDate).toLocaleDateString()}</Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Card>

          {/* Delivery Section */}
          <Card shadow="sm" padding="lg">
            <Group justify="space-between" mb="md">
              <Title
                order={3}
                onClick={() => {
                  navigate(ROUTERS.DELIVERY_MANAGEMENT);
                }}
                style={{ cursor: 'pointer' }}
              >
                {t('home.delivery.sectionTitle')}
              </Title>
              {(canViewAllDR || canViewMyDR) && <Badge color="orange" variant="filled" size="lg">
                {filteredTodayDeliveries.length}
              </Badge>}
            </Group>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('home.delivery.columns.drNumber')}</Table.Th>
                  <Table.Th>{t('home.delivery.columns.customer')}</Table.Th>
                  <Table.Th>{t('delivery.assignedTo')}</Table.Th>
                  <Table.Th>{t('home.delivery.columns.status')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!(canViewAllDR || canViewMyDR) ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('common.noPermission')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredTodayDeliveries.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('delivery.noDeliveryRequestsFound')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredTodayDeliveries.map((deliveryRequest) => (
                    <Table.Tr
                      key={deliveryRequest.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        handleDRClick(deliveryRequest.id);
                      }}
                    >
                      <Table.Td>
                        <Group gap="xs">
                          <Text fw={500}>{deliveryRequest.deliveryRequestNumber}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td><Text fw={400}>{deliveryRequest.customerName || deliveryRequest.vendorName}</Text></Table.Td>
                      <Table.Td>{deliveryRequest.deliveryPerson ?? '-'}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {deliveryRequest.isUrgentDelivery && <UrgentBadge size="xs" />}
                          <DeliveryTypeBadge type={deliveryRequest.type} size="xs" />
                          <DeliveryStatusBadge status={deliveryRequest.status} />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Card>

          {/* Warehouse Section */}
          <Card shadow="sm" padding="lg">
            <Group justify="space-between" mb="md">
              <Title
                order={3}
                onClick={() => {
                  navigate(ROUTERS.PO_MANAGEMENT);
                }}
                style={{ cursor: 'pointer' }}
              >
                {t('home.warehouse.sectionTitle')}
              </Title>
              {(canViewAllPO || canViewMyPO) && <Badge color="teal" variant="filled" size="lg">
                {filteredProcessingQueue.length}
              </Badge>}
            </Group>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('po.poNumber')}</Table.Th>
                  <Table.Th>{t('home.warehouse.columns.customer')}</Table.Th>
                  <Table.Th>{t('po.salesPerson')}</Table.Th>
                  <Table.Th>{t('po.poStatus')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {!(canViewAllPO || canViewMyPO) ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('common.noPermission')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : filteredProcessingQueue.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text c="dimmed" ta="center">
                        {t('po.noPOsFound')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredProcessingQueue.slice(0, 5).map((po) => (
                    <Table.Tr
                      key={po.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        handlePOClick(po.id);
                      }}
                    >
                      <Table.Td>
                        {renderPoNumber(po)}
                      </Table.Td>
                      <Table.Td>{po.customerName ?? '-'}</Table.Td>
                      <Table.Td>{po.salesPerson ?? '-'}</Table.Td>
                      <Table.Td>
                        <POStatusBadge status={po.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Stack>
      </Container>
    </AppDesktopLayout>
  );
}
