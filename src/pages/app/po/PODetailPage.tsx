import { useCallback, useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { LoadingOverlay, Stack } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

import {
  DeliveryRequestModal,
  PODetailAccordion,
  PODetailTabs,
  PODetailTabsSkeleton,
  POErrorBoundary,
  POStatusModal,
} from '@/components/app/po';
import { AppPageTitle, PermissionDeniedPage } from '@/components/common';
import { AppDesktopLayout, AppMobileLayout } from '@/components/common';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { getPOEditRoute, ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { usePOModals } from '@/hooks/usePOModals';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import { useCurrentPO, usePOActions, usePOError, usePOLoading } from '@/stores/usePOStore';
import { isPOEditable } from '@/utils/purchaseOrder';

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

  const confirmPOAction = useSWRAction(
    'confirm-po',
    async () => {
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!permissions.purchaseOrder.actions?.canConfirm) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      await confirmPurchaseOrder(selectedPO.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.confirmed'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.confirmFailed'),
      },
      onSuccess: () => {
        closeModal('confirm');
      },
    },
  );

  const processPOAction = useSWRAction(
    'process-po',
    async () => {
      if (!permissions.purchaseOrder.actions?.canProcess) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await processPurchaseOrder(selectedPO.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.processing'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.processFailed'),
      },
      onSuccess: () => {
        closeModal('process');
      },
    },
  );

  const markReadyPOAction = useSWRAction<
    { pickupLocation?: string; notificationMessage?: string } | undefined
  >(
    'mark-ready-po',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canMarkReady) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await markPurchaseOrderReady(selectedPO.id, data);
      return selectedPO;
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.markReady'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.markReadyFailed'),
      },
      onSuccess: () => {
        closeModal('markReady');
      },
    },
  );

  const shipPOAction = useSWRAction<any>(
    'ship-po',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canShip) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await shipPurchaseOrder(selectedPO.id, data);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.shipped'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.shipFailed'),
      },
      onSuccess: () => {
        closeModal('ship');
      },
    },
  );

  const deliverPOAction = useSWRAction<{ deliveryNotes?: string } | undefined>(
    'deliver-po',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canDeliver) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await deliverPurchaseOrder(selectedPO.id, data);
      return selectedPO;
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.delivered'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.deliverFailed'),
      },
      onSuccess: () => {
        closeModal('deliver');
      },
    },
  );

  const cancelPOAction = useSWRAction<any>(
    'cancel-po',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canCancel) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await cancelPurchaseOrder(selectedPO.id, data);
      return selectedPO;
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.cancelled'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.cancelFailed'),
      },
      onSuccess: () => {
        closeModal('cancel');
      },
    },
  );

  const refundPOAction = useSWRAction<{ refundReason?: string } | undefined>(
    'refund-po',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canRefund) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await refundPurchaseOrder(selectedPO.id, data);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.refunded'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.refundFailed'),
      },
      onSuccess: () => {
        closeModal('refund');
      },
    },
  );

  const { createDeliveryRequest } = useDeliveryRequestActions();

  const createDeliveryAction = useSWRAction<
    { assignedTo: string; scheduledDate: string; notes?: string } | undefined
  >(
    'create-delivery-request',
    async (data) => {
      if (!permissions.purchaseOrder.actions?.canShip) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!permissions.deliveryRequest.canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!data || !purchaseOrder) {
        throw new Error(t('common.invalidFormData'));
      }
      await createDeliveryRequest({
        purchaseOrderId: purchaseOrder.id,
        assignedTo: data.assignedTo,
        assignedType: 'EMPLOYEE' as const,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      });
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.deliveryRequestCreated'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.deliveryRequestCreateFailed'),
      },
      onSuccess: () => {
        setDeliveryModalOpened(false);
        navigate(ROUTERS.DELIVERY_MANAGEMENT);
      },
    },
  );

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
        loading={confirmPOAction.isMutating}
        onClose={handleCloseModal('confirm')}
        onConfirm={async () => {
          await confirmPOAction.trigger();
        }}
      />
      <POStatusModal
        opened={modals.processModalOpened}
        purchaseOrder={selectedPO}
        mode="process"
        loading={processPOAction.isMutating}
        onClose={handleCloseModal('process')}
        onConfirm={async () => {
          await processPOAction.trigger();
        }}
      />
      <POStatusModal
        opened={modals.markReadyModalOpened}
        purchaseOrder={selectedPO}
        mode="markReady"
        loading={markReadyPOAction.isMutating}
        onClose={handleCloseModal('markReady')}
        onConfirm={markReadyPOAction.trigger}
      />
      <POStatusModal
        opened={modals.shipModalOpened}
        purchaseOrder={selectedPO}
        mode="ship"
        loading={shipPOAction.isMutating}
        onClose={handleCloseModal('ship')}
        onConfirm={shipPOAction.trigger}
      />
      <POStatusModal
        opened={modals.deliverModalOpened}
        purchaseOrder={selectedPO}
        mode="deliver"
        loading={deliverPOAction.isMutating}
        onClose={handleCloseModal('deliver')}
        onConfirm={deliverPOAction.trigger}
      />
      <POStatusModal
        opened={modals.cancelModalOpened}
        purchaseOrder={selectedPO}
        mode="cancel"
        loading={cancelPOAction.isMutating}
        onClose={handleCloseModal('cancel')}
        onConfirm={cancelPOAction.trigger}
      />
      <POStatusModal
        opened={modals.refundModalOpened}
        purchaseOrder={selectedPO}
        mode="refund"
        loading={refundPOAction.isMutating}
        onClose={handleCloseModal('refund')}
        onConfirm={refundPOAction.trigger}
      />
      <DeliveryRequestModal
        opened={deliveryModalOpened}
        purchaseOrder={purchaseOrder}
        loading={createDeliveryAction.isMutating}
        onClose={() => setDeliveryModalOpened(false)}
        onConfirm={createDeliveryAction.trigger}
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
            canMarkReady={permissions.purchaseOrder.actions?.canMarkReady}
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
            canConfirm={permissions.purchaseOrder.actions?.canConfirm ?? false}
            canProcess={permissions.purchaseOrder.actions?.canProcess ?? false}
            canShip={permissions.purchaseOrder.actions?.canShip ?? false}
            canDeliver={permissions.purchaseOrder.actions?.canDeliver ?? false}
            canMarkReady={permissions.purchaseOrder.actions?.canMarkReady ?? false}
            canRefund={permissions.purchaseOrder.actions?.canRefund ?? false}
            canCancel={permissions.purchaseOrder.actions?.canCancel ?? false}
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
