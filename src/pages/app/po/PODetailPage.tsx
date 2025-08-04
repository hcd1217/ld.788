import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDisclosure } from '@mantine/hooks';
import { LoadingOverlay, Stack } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';
import { usePurchaseOrderList, usePOActions, usePOLoading } from '@/stores/usePOStore';
import {
  ResourceNotFound,
  DetailPageLayout,
  AppPageTitle,
  AppMobileLayout,
} from '@/components/common';
import {
  PODetailTabs,
  PODetailAccordion,
  POConfirmModal,
  POProcessModal,
  POShipModal,
  PODeliverModal,
  POCancelModal,
  PORefundModal,
  POErrorBoundary,
  PODetailTabsSkeleton,
} from '@/components/app/po';
import type { PurchaseOrder } from '@/services/sales/purchaseOrder';
import { getPOEditRoute } from '@/config/routeConfig';
import { useOnce } from '@/hooks/useOnce';
import { useAction } from '@/hooks/useAction';

export function PODetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const purchaseOrders = usePurchaseOrderList();
  const isLoading = usePOLoading();
  const {
    refreshPurchaseOrders,
    confirmPurchaseOrder,
    processPurchaseOrder,
    shipPurchaseOrder,
    deliverPurchaseOrder,
    cancelPurchaseOrder,
    refundPurchaseOrder,
  } = usePOActions();

  const purchaseOrder = purchaseOrders.find((po) => po.id === poId);

  const [poToConfirm, setPOToConfirm] = useState<PurchaseOrder | undefined>(undefined);
  const [poToProcess, setPOToProcess] = useState<PurchaseOrder | undefined>(undefined);
  const [poToShip, setPOToShip] = useState<PurchaseOrder | undefined>(undefined);
  const [poToDeliver, setPOToDeliver] = useState<PurchaseOrder | undefined>(undefined);
  const [poToCancel, setPOToCancel] = useState<PurchaseOrder | undefined>(undefined);
  const [poToRefund, setPOToRefund] = useState<PurchaseOrder | undefined>(undefined);

  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] =
    useDisclosure(false);
  const [processModalOpened, { open: openProcessModal, close: closeProcessModal }] =
    useDisclosure(false);
  const [shipModalOpened, { open: openShipModal, close: closeShipModal }] = useDisclosure(false);
  const [deliverModalOpened, { open: openDeliverModal, close: closeDeliverModal }] =
    useDisclosure(false);
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] =
    useDisclosure(false);
  const [refundModalOpened, { open: openRefundModal, close: closeRefundModal }] =
    useDisclosure(false);

  const handleEdit = () => {
    if (purchaseOrder && purchaseOrder.status === 'NEW') {
      navigate(getPOEditRoute(purchaseOrder.id));
    }
  };

  const handleConfirm = () => {
    if (purchaseOrder) {
      setPOToConfirm(purchaseOrder);
      openConfirmModal();
    }
  };

  const handleProcess = () => {
    if (purchaseOrder) {
      setPOToProcess(purchaseOrder);
      openProcessModal();
    }
  };

  const handleShip = () => {
    if (purchaseOrder) {
      setPOToShip(purchaseOrder);
      openShipModal();
    }
  };

  const handleDeliver = () => {
    if (purchaseOrder) {
      setPOToDeliver(purchaseOrder);
      openDeliverModal();
    }
  };

  const handleCancel = () => {
    if (purchaseOrder) {
      setPOToCancel(purchaseOrder);
      openCancelModal();
    }
  };

  const handleRefund = () => {
    if (purchaseOrder) {
      setPOToRefund(purchaseOrder);
      openRefundModal();
    }
  };

  const confirmPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.confirmed'),
      errorTitle: t('common.error'),
      errorMessage: t('po.confirmFailed'),
    },
    async actionHandler() {
      if (!poToConfirm) {
        throw new Error(t('po.confirmFailed'));
      }
      await confirmPurchaseOrder(poToConfirm.id);
      closeConfirmModal();
    },
    cleanupHandler() {
      setPOToConfirm(undefined);
    },
  });

  const processPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.processing'),
      errorTitle: t('common.error'),
      errorMessage: t('po.processFailed'),
    },
    async actionHandler() {
      if (!poToProcess) {
        throw new Error(t('po.processFailed'));
      }
      await processPurchaseOrder(poToProcess.id);
      closeProcessModal();
    },
    cleanupHandler() {
      setPOToProcess(undefined);
    },
  });

  const shipPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.shipped'),
      errorTitle: t('common.error'),
      errorMessage: t('po.shipFailed'),
    },
    async actionHandler() {
      if (!poToShip) {
        throw new Error(t('po.shipFailed'));
      }
      await shipPurchaseOrder(poToShip.id);
      closeShipModal();
    },
    cleanupHandler() {
      setPOToShip(undefined);
    },
  });

  const deliverPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.delivered'),
      errorTitle: t('common.error'),
      errorMessage: t('po.deliverFailed'),
    },
    async actionHandler() {
      if (!poToDeliver) {
        throw new Error(t('po.deliverFailed'));
      }
      await deliverPurchaseOrder(poToDeliver.id);
      closeDeliverModal();
    },
    cleanupHandler() {
      setPOToDeliver(undefined);
    },
  });

  const cancelPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.cancelled'),
      errorTitle: t('common.error'),
      errorMessage: t('po.cancelFailed'),
    },
    async actionHandler() {
      if (!poToCancel) {
        throw new Error(t('po.cancelFailed'));
      }
      await cancelPurchaseOrder(poToCancel.id);
      closeCancelModal();
    },
    cleanupHandler() {
      setPOToCancel(undefined);
    },
  });

  const refundPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.refunded'),
      errorTitle: t('common.error'),
      errorMessage: t('po.refundFailed'),
    },
    async actionHandler() {
      if (!poToRefund) {
        throw new Error(t('po.refundFailed'));
      }
      await refundPurchaseOrder(poToRefund.id);
      closeRefundModal();
    },
    cleanupHandler() {
      setPOToRefund(undefined);
    },
  });

  useOnce(() => {
    void refreshPurchaseOrders();
  });

  // Modal components
  const confirmComponent = (
    <POConfirmModal
      opened={confirmModalOpened}
      purchaseOrder={poToConfirm}
      onClose={closeConfirmModal}
      onConfirm={confirmPOAction}
    />
  );

  const processComponent = (
    <POProcessModal
      opened={processModalOpened}
      purchaseOrder={poToProcess}
      onClose={closeProcessModal}
      onConfirm={processPOAction}
    />
  );

  const shipComponent = (
    <POShipModal
      opened={shipModalOpened}
      purchaseOrder={poToShip}
      onClose={closeShipModal}
      onConfirm={shipPOAction}
    />
  );

  const deliverComponent = (
    <PODeliverModal
      opened={deliverModalOpened}
      purchaseOrder={poToDeliver}
      onClose={closeDeliverModal}
      onConfirm={deliverPOAction}
    />
  );

  const cancelComponent = (
    <POCancelModal
      opened={cancelModalOpened}
      purchaseOrder={poToCancel}
      onClose={closeCancelModal}
      onConfirm={cancelPOAction}
    />
  );

  const refundComponent = (
    <PORefundModal
      opened={refundModalOpened}
      purchaseOrder={poToRefund}
      onClose={closeRefundModal}
      onConfirm={refundPOAction}
    />
  );

  const title = purchaseOrder ? purchaseOrder.poNumber : t('po.poDetails');

  if (!isDesktop) {
    if (isLoading || !purchaseOrder) {
      return (
        <AppMobileLayout showLogo isLoading={isLoading} header={<AppPageTitle title={title} />}>
          {isLoading ? (
            <LoadingOverlay visible />
          ) : (
            <ResourceNotFound withGoBack message={t('po.notFound')} />
          )}
        </AppMobileLayout>
      );
    }

    return (
      <AppMobileLayout
        withGoBack
        noFooter
        isLoading={isLoading}
        header={<AppPageTitle title={title} />}
      >
        <Stack gap="md">
          <PODetailAccordion
            purchaseOrder={purchaseOrder}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
            onProcess={handleProcess}
            onShip={handleShip}
            onDeliver={handleDeliver}
            onCancel={handleCancel}
            onRefund={handleRefund}
          />
        </Stack>
        {confirmComponent}
        {processComponent}
        {shipComponent}
        {deliverComponent}
        {cancelComponent}
        {refundComponent}
      </AppMobileLayout>
    );
  }

  return (
    <DetailPageLayout titleAlign="center" title={title} isLoading={false}>
      {isLoading ? (
        <Stack gap="md">
          <PODetailTabsSkeleton />
        </Stack>
      ) : purchaseOrder ? (
        <Stack gap="md">
          <POErrorBoundary componentName="PODetailTabs">
            <PODetailTabs
              purchaseOrder={purchaseOrder}
              onEdit={handleEdit}
              onConfirm={handleConfirm}
              onProcess={handleProcess}
              onShip={handleShip}
              onDeliver={handleDeliver}
              onCancel={handleCancel}
              onRefund={handleRefund}
            />
          </POErrorBoundary>
        </Stack>
      ) : (
        <ResourceNotFound message={t('po.notFound')} />
      )}
      {confirmComponent}
      {processComponent}
      {shipComponent}
      {deliverComponent}
      {cancelComponent}
      {refundComponent}
    </DetailPageLayout>
  );
}
