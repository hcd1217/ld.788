import { useNavigate, useParams } from 'react-router';
import { LoadingOverlay, Stack } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { usePurchaseOrderList, usePOActions, usePOLoading } from '@/stores/usePOStore';
import { usePOModals } from '@/hooks/usePOModals';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { DetailPageLayout } from '@/components/common/layouts/DetailPageLayout';
import { AppPageTitle } from '@/components/common';
import { AppMobileLayout } from '@/components/common';
import {
  PODetailTabs,
  PODetailAccordion,
  POActionModal,
  POErrorBoundary,
  PODetailTabsSkeleton,
} from '@/components/app/po';
import { getPOEditRoute } from '@/config/routeConfig';
import { useOnce } from '@/hooks/useOnce';
import { useAction } from '@/hooks/useAction';

export function PODetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
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

  // Use the centralized modal hook
  const { modals, selectedPO, closeModal, handlers } = usePOModals();

  const handleEdit = () => {
    if (purchaseOrder && purchaseOrder.status === 'NEW') {
      navigate(getPOEditRoute(purchaseOrder.id));
    }
  };

  const handleConfirm = () => {
    if (purchaseOrder) {
      handlers.handleConfirm(purchaseOrder);
    }
  };

  const handleProcess = () => {
    if (purchaseOrder) {
      handlers.handleProcess(purchaseOrder);
    }
  };

  const handleShip = () => {
    if (purchaseOrder) {
      handlers.handleShip(purchaseOrder);
    }
  };

  const handleDeliver = () => {
    if (purchaseOrder) {
      handlers.handleDeliver(purchaseOrder);
    }
  };

  const handleCancel = () => {
    if (purchaseOrder) {
      handlers.handleCancel(purchaseOrder);
    }
  };

  const handleRefund = () => {
    if (purchaseOrder) {
      handlers.handleRefund(purchaseOrder);
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
      if (!selectedPO) {
        throw new Error(t('po.confirmFailed'));
      }
      await confirmPurchaseOrder(selectedPO.id);
      closeModal('confirm');
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
      if (!selectedPO) {
        throw new Error(t('po.processFailed'));
      }
      await processPurchaseOrder(selectedPO.id);
      closeModal('process');
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
      if (!selectedPO) {
        throw new Error(t('po.shipFailed'));
      }
      await shipPurchaseOrder(selectedPO.id);
      closeModal('ship');
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
      if (!selectedPO) {
        throw new Error(t('po.deliverFailed'));
      }
      await deliverPurchaseOrder(selectedPO.id);
      closeModal('deliver');
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
      if (!selectedPO) {
        throw new Error(t('po.cancelFailed'));
      }
      await cancelPurchaseOrder(selectedPO.id);
      closeModal('cancel');
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
      if (!selectedPO) {
        throw new Error(t('po.refundFailed'));
      }
      await refundPurchaseOrder(selectedPO.id);
      closeModal('refund');
    },
  });

  useOnce(() => {
    void refreshPurchaseOrders();
  });

  // Modal components using the generic POActionModal
  const modalComponents = (
    <>
      <POActionModal
        opened={modals.confirmModalOpened}
        purchaseOrder={selectedPO}
        action="confirm"
        onClose={() => closeModal('confirm')}
        onConfirm={confirmPOAction}
      />
      <POActionModal
        opened={modals.processModalOpened}
        purchaseOrder={selectedPO}
        action="process"
        onClose={() => closeModal('process')}
        onConfirm={processPOAction}
      />
      <POActionModal
        opened={modals.shipModalOpened}
        purchaseOrder={selectedPO}
        action="ship"
        onClose={() => closeModal('ship')}
        onConfirm={shipPOAction}
      />
      <POActionModal
        opened={modals.deliverModalOpened}
        purchaseOrder={selectedPO}
        action="deliver"
        onClose={() => closeModal('deliver')}
        onConfirm={deliverPOAction}
      />
      <POActionModal
        opened={modals.cancelModalOpened}
        purchaseOrder={selectedPO}
        action="cancel"
        onClose={() => closeModal('cancel')}
        onConfirm={cancelPOAction}
      />
      <POActionModal
        opened={modals.refundModalOpened}
        purchaseOrder={selectedPO}
        action="refund"
        onClose={() => closeModal('refund')}
        onConfirm={refundPOAction}
      />
    </>
  );

  const title = purchaseOrder ? purchaseOrder.poNumber : t('po.poDetails');

  if (isMobile) {
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
        {modalComponents}
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
      {modalComponents}
    </DetailPageLayout>
  );
}
