import { Accordion, Stack, Group, Text, Button, Badge, Grid } from '@mantine/core';
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
import { formatCurrency } from '@/utils/number';
import { POStatusBadge } from './POStatusBadge';

type PODetailAccordionProps = {
  readonly purchaseOrder: PurchaseOrder;
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
  onEdit,
  onConfirm,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
}: PODetailAccordionProps) {
  const { t } = useTranslation();

  const getActionButtons = () => {
    const buttons = [];

    if (purchaseOrder.status === 'NEW') {
      buttons.push(
        <Button
          key="edit"
          variant="light"
          size="xs"
          leftSection={<IconEdit size={14} />}
          onClick={onEdit}
        >
          {t('common.edit')}
        </Button>,
        <Button
          key="confirm"
          color="green"
          size="xs"
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
                  <Text size="sm">{purchaseOrder.customer?.name || '-'}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" fw={500} c="dimmed">
                    {t('po.totalAmount')}
                  </Text>
                  <Text size="sm" fw={600} c="blue">
                    {formatCurrency(purchaseOrder.totalAmount)}
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
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </Text>
                    <Text size="xs" fw={500}>
                      {formatCurrency(item.totalPrice)}
                    </Text>
                  </div>
                </Group>
              ))}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        {purchaseOrder.shippingAddress && (
          <Accordion.Item value="address">
            <Accordion.Control icon={<IconMapPin size={16} />}>
              {t('po.shippingAddress')}
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="sm">
                {purchaseOrder.shippingAddress.street}
                <br />
                {purchaseOrder.shippingAddress.city}
                {purchaseOrder.shippingAddress.state && `, ${purchaseOrder.shippingAddress.state}`}
                {purchaseOrder.shippingAddress.postalCode &&
                  ` ${purchaseOrder.shippingAddress.postalCode}`}
                <br />
                {purchaseOrder.shippingAddress.country}
              </Text>
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>

      {getActionButtons().length > 0 && <Group gap="xs">{getActionButtons()}</Group>}
    </Stack>
  );
}
