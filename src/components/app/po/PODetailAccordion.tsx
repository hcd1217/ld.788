import { Accordion, Group, Stack, Text } from '@mantine/core';
import {
  IconClipboardList,
  IconHistory,
  IconInfoCircle,
  IconMapPin,
  IconPhoto,
} from '@tabler/icons-react';

import { ViewOnMap } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';

import { POAccordionActions } from './POAccordionActions';
import { POAccordionHistoryPanel } from './POAccordionHistoryPanel';
import { POAccordionInfoPanel } from './POAccordionInfoPanel';
import { POAccordionItemsPanel } from './POAccordionItemsPanel';
import { POPhotoGallery } from './POPhotoGallery';

type PODetailAccordionProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading?: boolean;
  readonly onEdit: () => void;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onMarkReady: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
  readonly onCreateDelivery: () => void;
};

export function PODetailAccordion({
  purchaseOrder,
  isLoading = false,
  onEdit,
  onConfirm,
  onProcess,
  onMarkReady,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onCreateDelivery,
}: PODetailAccordionProps) {
  const { t } = useTranslation();
  return (
    <Stack gap="md">
      <Accordion defaultValue="info" variant="contained">
        <Accordion.Item value="info">
          <Accordion.Control icon={<IconInfoCircle size={16} />}>
            {t('po.orderInformation')}
          </Accordion.Control>
          <Accordion.Panel>
            <POAccordionInfoPanel
              purchaseOrder={purchaseOrder}
              isLoading={isLoading}
              onEdit={onEdit}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="items">
          <Accordion.Control icon={<IconClipboardList size={16} />}>
            {t('po.orderItems')}
          </Accordion.Control>
          <Accordion.Panel>
            <POAccordionItemsPanel purchaseOrder={purchaseOrder} />
          </Accordion.Panel>
        </Accordion.Item>

        {purchaseOrder.statusHistory && purchaseOrder.statusHistory.length > 0 && (
          <Accordion.Item value="history">
            <Accordion.Control icon={<IconHistory size={16} />}>
              {t('po.orderTimeline')}
            </Accordion.Control>
            <Accordion.Panel>
              <POAccordionHistoryPanel purchaseOrder={purchaseOrder} />
            </Accordion.Panel>
          </Accordion.Item>
        )}

        {purchaseOrder.address && (
          <Accordion.Item value="address">
            <Accordion.Control icon={<IconMapPin size={16} />}>
              <Group justify="start" align="center" gap="sm">
                <Text size="sm">{t('po.shippingAddress')}</Text>
                <ViewOnMap googleMapsUrl={purchaseOrder.googleMapsUrl} />
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <Group justify="space-between" align="flex-start">
                <Text size="sm">{purchaseOrder.address}</Text>
              </Group>
            </Accordion.Panel>
          </Accordion.Item>
        )}

        {/* Photos Accordion */}
        {purchaseOrder.photos && purchaseOrder.photos.length > 0 && (
          <Accordion.Item value="photos">
            <Accordion.Control icon={<IconPhoto size={16} />}>
              {t('delivery.photos')}
            </Accordion.Control>
            <Accordion.Panel>
              <POPhotoGallery
                photos={purchaseOrder.photos}
                withScrollArea
                scrollAreaHeight="30vh"
              />
            </Accordion.Panel>
          </Accordion.Item>
        )}
      </Accordion>

      <POAccordionActions
        purchaseOrder={purchaseOrder}
        isLoading={isLoading}
        onConfirm={onConfirm}
        onProcess={onProcess}
        onMarkReady={onMarkReady}
        onShip={onShip}
        onDeliver={onDeliver}
        onCancel={onCancel}
        onRefund={onRefund}
        onCreateDelivery={onCreateDelivery}
      />
    </Stack>
  );
}
