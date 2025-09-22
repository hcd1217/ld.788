import { useState } from 'react';

import { Button, Group, ScrollArea, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconClipboardList,
  IconFileExport,
  IconFileInvoice,
  IconFileTypePdf,
  IconInfoCircle,
  IconMessage,
  IconPhoto,
  IconPrinter,
  IconTruck,
} from '@tabler/icons-react';

import { ComingSoonCard, Tabs } from '@/components/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { usePermissions } from '@/stores/useAppStore';
import { usePOActions } from '@/stores/usePOStore';
import { canDeletePhotoPurchaseOrder } from '@/utils/permission.utils';

import { POActionZone } from './POActionZone';
import { POBasicInfoCard } from './POBasicInfoCard';
import { POErrorBoundary } from './POErrorBoundary';
import { POItemsList } from './POItemsList';
import { POPhotoGallery } from './POPhotoGallery';
import { POTimeline } from './POTimeline';

type PODetailTabsProps = {
  readonly purchaseOrder: PurchaseOrder;
  readonly isLoading: boolean;
  readonly onConfirm: () => void;
  readonly onProcess: () => void;
  readonly onMarkReady: () => void;
  readonly onShip: () => void;
  readonly onDeliver: () => void;
  readonly onCancel: () => void;
  readonly onRefund: () => void;
  readonly onCreateDelivery?: () => void;
};

export function PODetailTabs({
  purchaseOrder,
  isLoading = false,
  onConfirm,
  onProcess,
  onMarkReady,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onCreateDelivery,
}: PODetailTabsProps) {
  const { t } = useTranslation();
  const permissions = usePermissions();
  const { deletePhoto } = usePOActions();
  const canDelete = canDeletePhotoPurchaseOrder(permissions);

  const [value, setValue] = useState<
    'info' | 'items' | 'timeline' | 'photos' | 'documents' | 'communication'
  >('info');

  const handlePrint = () => {
    window.print();
    notifications.show({
      title: t('common.success'),
      message: t('po.printInitiated'),
      color: 'green',
    });
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    notifications.show({
      title: 'Info',
      message: t('po.exportPDFComingSoon'),
      color: 'blue',
    });
  };

  const handleExportExcel = () => {
    // Placeholder for Excel export functionality
    notifications.show({
      title: 'Info',
      message: t('po.exportExcelComingSoon'),
      color: 'blue',
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(purchaseOrder.id, photoId);
      notifications.show({
        title: t('common.success'),
        message: 'Photo deleted successfully',
        color: 'green',
      });
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete photo',
        color: 'red',
      });
    }
  };

  return (
    <Tabs defaultValue="info" value={value} onChange={(value) => setValue(value as any)}>
      <ScrollArea offsetScrollbars scrollbarSize={4}>
        <Tabs.List>
          <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
            {t('po.orderInformation')}
          </Tabs.Tab>
          <Tabs.Tab value="photos" leftSection={<IconPhoto size={16} />}>
            {t('delivery.photos')}
          </Tabs.Tab>
          <Tabs.Tab value="items" leftSection={<IconClipboardList size={16} />}>
            {t('po.orderItems')}
          </Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconTruck size={16} />}>
            {t('po.orderTimeline')}
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFileInvoice size={16} />}>
            {t('po.documents')}
          </Tabs.Tab>
          <Tabs.Tab value="communication" leftSection={<IconMessage size={16} />}>
            {t('po.communicationLog')}
          </Tabs.Tab>
        </Tabs.List>
      </ScrollArea>

      <Tabs.Panel value="info" pt="xl">
        <Stack gap="sm">
          <POActionZone
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
          <POErrorBoundary componentName="POBasicInfoCard">
            <POBasicInfoCard
              purchaseOrder={purchaseOrder}
              onNavigateToItemsList={() => {
                setValue('items');
              }}
            />
          </POErrorBoundary>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="items" pt="xl">
        <POItemsList purchaseOrder={purchaseOrder} />
      </Tabs.Panel>

      <Tabs.Panel value="timeline" pt="xl">
        <POTimeline purchaseOrder={purchaseOrder} />
      </Tabs.Panel>

      <Tabs.Panel value="photos" pt="xl">
        <POPhotoGallery
          photos={purchaseOrder.photos}
          columns={2}
          withScrollArea
          scrollAreaHeight="65vh"
          canDelete={canDelete}
          onDeletePhoto={handleDeletePhoto}
          // imageHeight={320}
        />
      </Tabs.Panel>

      <Tabs.Panel value="documents" pt="xl">
        <Stack gap="lg">
          <Group gap="sm">
            <Button leftSection={<IconPrinter size={16} />} onClick={handlePrint}>
              {t('po.print')}
            </Button>
            <Button
              variant="light"
              leftSection={<IconFileTypePdf size={16} />}
              onClick={handleExportPDF}
            >
              {t('po.exportPDF')}
            </Button>
            <Button
              variant="light"
              leftSection={<IconFileExport size={16} />}
              onClick={handleExportExcel}
            >
              {t('po.exportExcel')}
            </Button>
          </Group>
          <ComingSoonCard
            icon={<IconFileInvoice size={48} color="var(--mantine-color-gray-5)" />}
            title={t('po.documentsComingSoon')}
          />
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="communication" pt="xl">
        <ComingSoonCard
          icon={<IconMessage size={48} color="var(--mantine-color-gray-5)" />}
          title={t('po.communicationLogComingSoon')}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
