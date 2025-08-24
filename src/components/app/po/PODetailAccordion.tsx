import {
  Accordion,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Grid,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconEdit,
  IconCheck,
  IconPackage,
  IconTruck,
  IconPackageExport,
  IconX,
  IconReceipt,
  IconInfoCircle,
  IconClipboardList,
  IconMapPin,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { formatDate } from '@/utils/time';
import { POStatusBadge } from './POStatusBadge';
import { getCustomerNameByCustomerId } from '@/utils/overview';
import { useCustomerMapByCustomerId } from '@/stores/useAppStore';

type PODetailAccordionProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onEdit: () => void;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
};

export function PODetailAccordion({
  purchaseOrder,
  isLoading = false,
  onEdit,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
}: PODetailAccordionProps) {
  const { t } = useTranslation();
  const customerMapByCustomerId = useCustomerMapByCustomerId();
  const getActionButtons = () => {
    const buttons = [];

    if (purchaseOrder.status === 'NEW') {
      buttons.push(
        <Button
          key="edit"
          variant="light"
          size="xs"
          loading={isLoading}
          leftSection={<IconEdit size={14} />}
          onClick={onEdit}
        >
          {t('common.edit')}
        </Button>,
        <Button
          key="confirm"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconCheck size={14} />}
          onClick={onConfirm}
        >
          {t('po.confirm')}
        </Button>,
        <Button
          key="cancel"
          color="red"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconX size={14} />}
          onClick={onCancel}
        >
          {t('po.cancel')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'CONFIRMED') {
      buttons.push(
        <Button
          key="process"
          color="blue"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackage size={14} />}
          onClick={onProcess}
        >
          {t('po.process')}
        </Button>,
        <Button
          key="cancel"
          color="red"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconX size={14} />}
          onClick={onCancel}
        >
          {t('po.cancel')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'PROCESSING') {
      buttons.push(
        <Button
          key="ship"
          color="indigo"
          size="xs"
          loading={isLoading}
          leftSection={<IconTruck size={14} />}
          onClick={onShip}
        >
          {t('po.ship')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'SHIPPED') {
      buttons.push(
        <Button
          key="deliver"
          color="green"
          size="xs"
          loading={isLoading}
          leftSection={<IconPackageExport size={14} />}
          onClick={onDeliver}
        >
          {t('po.markDelivered')}
        </Button>,
        <Button
          key="refund"
          color="orange"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconReceipt size={14} />}
          onClick={onRefund}
        >
          {t('po.refund')}
        </Button>,
      );
    } else if (purchaseOrder.status === 'DELIVERED') {
      buttons.push(
        <Button
          key="refund"
          color="orange"
          variant="outline"
          size="xs"
          loading={isLoading}
          leftSection={<IconReceipt size={14} />}
          onClick={onRefund}
        >
          {t('po.refund')}
        </Button>,
      );
    }

    return buttons;
  };

  return (
    <Stack gap="md">
      <Accordion defaultValue="info" variant="contained">
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconInfoCircle size={16} />}>
            {t('po.orderInformation')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.poNumber')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {purchaseOrder.poNumber}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.poStatus')}
                  </Text>
                  <POStatusBadge status={purchaseOrder.status} size="sm" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.customer')}
                  </Text>
                  <Text size="sm">
                    {getCustomerNameByCustomerId(customerMapByCustomerId, purchaseOrder.customerId)}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.orderDate')}
                  </Text>
                  <Text size="sm">{formatDate(purchaseOrder.orderDate)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.items')}
                  </Text>
                  <Badge variant="light" size="sm">
                    {purchaseOrder.items.length}
                  </Badge>
                </Grid.Col>
              </Grid>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="items">
          <Accordion.Control icon={<IconClipboardList size={16} />}>
            {t('po.orderItems')}
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              {purchaseOrder.items.map((item) => (
                <Group
                  key={item.id}
                  justify="space-between"
                  p="xs"
                  style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
                >
                  <div>
                    <Text size="sm" fw={500}>
                      {item.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {item.productCode}
                    </Text>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Text size="sm">
                      {t('po.quantity')}: {item.quantity}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {purchaseOrder.address && (
          <Accordion.Item value="address">
            <Accordion.Control icon={<IconMapPin size={16} />}>
              <Group justify="start" align="center" gap="sm">
                <Text size="sm">{t('po.shippingAddress')}</Text>
                {purchaseOrder.googleMapsUrl && (
                  <Tooltip label={t('customer.viewOnMap')}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => {
                        const googleMapsUrl = purchaseOrder.googleMapsUrl;
                        if (googleMapsUrl) {
                          window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <IconMapPin size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Group justify="space-between" align="flex-start">
                <Text size="sm">{purchaseOrder.address}</Text>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>

      {getActionButtons().length > 0 && <Group gap="xs">{getActionButtons()}</Group>}
    </Stack>
  );
}
