import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { LoadingOverlay, Stack } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useCurrentPO, usePOActions, usePOLoading, usePOError } from '@/stores/usePOStore';
import { usePOModals } from '@/hooks/usePOModals';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { AppPageTitle, PermissionDeniedPage } from '@/components/common';
import { AppMobileLayout, AppDesktopLayout } from '@/components/common';
import {
  PODetailTabs,
  PODetailAccordion,
  POStatusModal,
  POErrorBoundary,
  PODetailTabsSkeleton,
  DeliveryRequestModal,
} from '@/components/app/po';
import { getPOEditRoute, ROUTERS } from '@/config/routeConfig';
import { useAction } from '@/hooks/useAction';
import { isPOEditable } from '@/utils/purchaseOrder';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import { usePermissions } from '@/stores/useAppStore';

export function PODetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();
  const purchaseOrder = useCurrentPO();
  const isLoading = usePOLoading();
  const error = usePOError();
  const {
    loadPO,
    confirmPurchaseOrder,
    processPurchaseOrder,
    markPurchaseOrderReady,
    shipPurchaseOrder,
    deliverPurchaseOrder,
    cancelPurchaseOrder,
    refundPurchaseOrder,
    clearError,
  } = usePOActions();

  // Use the centralized modal hook
  const { modals, selectedPO, closeModal, handlers } = usePOModals();

  // Delivery modal state
  const [deliveryModalOpened, setDeliveryModalOpened] = useState(false);

  // Memoized modal close handler
  const handleCloseModal = useCallback(
    (modalType: 'confirm' | 'process' | 'markReady' | 'ship' | 'deliver' | 'cancel' | 'refund') =>
      () =>
        closeModal(modalType),
    [closeModal],
  );

  const handleEdit = () => {
    if (purchaseOrder && isPOEditable(purchaseOrder) && permissions.purchaseOrder.canEdit) {
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

  const handleMarkReady = () => {
    if (purchaseOrder) {
      handlers.handleMarkReady(purchaseOrder);
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

  const handleCreateDelivery = () => {
    if (purchaseOrder) {
      setDeliveryModalOpened(true);
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
      if (!permissions.purchaseOrder.actions?.canConfirm) {
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
      if (!permissions.purchaseOrder.actions?.canProcess) {
        throw new Error(t('po.processFailed'));
      }
      await processPurchaseOrder(selectedPO.id);
      closeModal('process');
    },
  });

  const markReadyPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.markReady'),
      errorTitle: t('common.error'),
      errorMessage: t('po.markReadyFailed'),
    },
    async actionHandler(data?: { pickupLocation?: string; notificationMessage?: string }) {
      if (!selectedPO) {
        throw new Error(t('po.markReadyFailed'));
      }
      if (!permissions.purchaseOrder.actions?.canMarkReady) {
        throw new Error(t('po.markReadyFailed'));
      }
      await markPurchaseOrderReady(selectedPO.id, data);
      closeModal('markReady');
    },
  });

  const shipPOAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.shipped'),
      errorTitle: t('common.error'),
      errorMessage: t('po.shipFailed'),
    },
    async actionHandler(data?: any) {
      if (!selectedPO || !permissions.purchaseOrder.actions?.canShip) {
        throw new Error(t('po.shipFailed'));
      }
      await shipPurchaseOrder(selectedPO.id, data);
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
    async actionHandler(data?: { deliveryNotes?: string }) {
      if (!selectedPO || !permissions.purchaseOrder.actions?.canDeliver) {
        throw new Error(t('po.deliverFailed'));
      }
      await deliverPurchaseOrder(selectedPO.id, data);
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
    async actionHandler(data) {
      if (!selectedPO) {
        throw new Error(t('po.cancelFailed'));
      }
      if (!permissions.purchaseOrder.actions?.canCancel) {
        throw new Error(t('po.cancelFailed'));
      }
      await cancelPurchaseOrder(selectedPO.id, data);
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
    async actionHandler(data?: { refundReason?: string }) {
      if (!selectedPO) {
        throw new Error(t('po.refundFailed'));
      }
      if (!permissions.purchaseOrder.actions?.canRefund) {
        throw new Error(t('po.refundFailed'));
      }
      await refundPurchaseOrder(selectedPO.id, data);
      closeModal('refund');
    },
  });

  const { createDeliveryRequest } = useDeliveryRequestActions();

  const createDeliveryAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('po.deliveryRequestCreated'),
      errorTitle: t('common.error'),
      errorMessage: t('po.deliveryRequestCreateFailed'),
      navigateTo: ROUTERS.DELIVERY_MANAGEMENT,
    },
    async actionHandler(data?: { assignedTo: string; scheduledDate: string; notes?: string }) {
      if (!data || !purchaseOrder) {
        throw new Error(t('po.deliveryRequestCreateFailed'));
      }
      if (!permissions.purchaseOrder.actions?.canDeliver) {
        throw new Error(t('po.deliveryRequestCreateFailed'));
      }
      if (!permissions.deliveryRequest.canCreate) {
        throw new Error(t('po.deliveryRequestCreateFailed'));
      }
      await createDeliveryRequest({
        purchaseOrderId: purchaseOrder.id,
        assignedTo: data.assignedTo,
        assignedType: 'EMPLOYEE' as const,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      });
      setDeliveryModalOpened(false);
    },
  });

  useEffect(() => {
    if (poId) {
      void loadPO(poId);
    }
  }, [poId, loadPO]);

  // Modal components using the enhanced POStatusModal
  const modalComponents = (
    <>
      <POStatusModal
        opened={modals.confirmModalOpened}
        purchaseOrder={selectedPO}
        mode="confirm"
        onClose={handleCloseModal('confirm')}
        onConfirm={confirmPOAction}
      />
      <POStatusModal
        opened={modals.processModalOpened}
        purchaseOrder={selectedPO}
        mode="process"
        onClose={handleCloseModal('process')}
        onConfirm={processPOAction}
      />
      <POStatusModal
        opened={modals.markReadyModalOpened}
        purchaseOrder={selectedPO}
        mode="markReady"
        onClose={handleCloseModal('markReady')}
        onConfirm={markReadyPOAction}
      />
      <POStatusModal
        opened={modals.shipModalOpened}
        purchaseOrder={selectedPO}
        mode="ship"
        onClose={handleCloseModal('ship')}
        onConfirm={shipPOAction}
      />
      <POStatusModal
        opened={modals.deliverModalOpened}
        purchaseOrder={selectedPO}
        mode="deliver"
        onClose={handleCloseModal('deliver')}
        onConfirm={deliverPOAction}
      />
      <POStatusModal
        opened={modals.cancelModalOpened}
        purchaseOrder={selectedPO}
        mode="cancel"
        onClose={handleCloseModal('cancel')}
        onConfirm={cancelPOAction}
      />
      <POStatusModal
        opened={modals.refundModalOpened}
        purchaseOrder={selectedPO}
        mode="refund"
        onClose={handleCloseModal('refund')}
        onConfirm={refundPOAction}
      />
      <DeliveryRequestModal
        opened={deliveryModalOpened}
        purchaseOrder={purchaseOrder}
        onClose={() => setDeliveryModalOpened(false)}
        onConfirm={createDeliveryAction}
      />
    </>
  );

  const title = purchaseOrder ? purchaseOrder.poNumber : t('po.poDetails');

  // Show edit button when PO is editable (status = NEW) - moved before early returns
  const isEditable = purchaseOrder && isPOEditable(purchaseOrder);

  if (!permissions.purchaseOrder.canView) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    if (isLoading || !purchaseOrder) {
      return (
        <AppMobileLayout
          showLogo
          isLoading={isLoading}
          error={error}
          clearError={clearError}
          header={<AppPageTitle title={title} />}
        >
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
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={title} />}
      >
        <Stack gap="md">
          <PODetailAccordion
            canEdit={permissions.purchaseOrder.canEdit}
            canConfirm={permissions.purchaseOrder.actions?.canConfirm}
            canProcess={permissions.purchaseOrder.actions?.canProcess}
            canShip={permissions.purchaseOrder.actions?.canShip}
            canDeliver={permissions.purchaseOrder.actions?.canDeliver}
            canRefund={permissions.purchaseOrder.actions?.canRefund}
            canCancel={permissions.purchaseOrder.actions?.canCancel}
            purchaseOrder={purchaseOrder}
            isLoading={isLoading}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
            onProcess={handleProcess}
            onMarkReady={handleMarkReady}
            onShip={handleShip}
            onDeliver={handleDeliver}
            onCancel={handleCancel}
            onRefund={handleRefund}
            onCreateDelivery={handleCreateDelivery}
          />
        </Stack>
        {modalComponents}
      </AppMobileLayout>
    );
  }

  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle
        withGoBack
        route={ROUTERS.PO_MANAGEMENT}
        title={title}
        button={
          isEditable
            ? {
                label: t('common.edit'),
                onClick: handleEdit,
                disabled: !permissions.purchaseOrder.canEdit,
                icon: <IconEdit size={16} />,
              }
            : undefined
        }
      />

      {isLoading ? (
        <PODetailTabsSkeleton />
      ) : purchaseOrder ? (
        <POErrorBoundary componentName="PODetailTabs">
          <PODetailTabs
            canEdit={permissions.purchaseOrder.canEdit}
            purchaseOrder={purchaseOrder}
            isLoading={isLoading}
            onConfirm={handleConfirm}
            onProcess={handleProcess}
            onMarkReady={handleMarkReady}
            onShip={handleShip}
            onDeliver={handleDeliver}
            onCancel={handleCancel}
            onRefund={handleRefund}
            onCreateDelivery={handleCreateDelivery}
          />
        </POErrorBoundary>
      ) : (
        <ResourceNotFound message={t('po.notFound')} />
      )}

      {modalComponents}
    </AppDesktopLayout>
  );
}
