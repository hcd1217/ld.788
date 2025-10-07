import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import { Affix, Button, Group, LoadingOverlay, Stack } from '@mantine/core';
import { IconCamera, IconCopy, IconEdit } from '@tabler/icons-react';

import {
  DeliveryRequestModal,
  PODetailAccordion,
  PODetailTabs,
  PODetailTabsSkeleton,
  POErrorBoundary,
  POPhotoUpload,
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
import {
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canCreatePurchaseOrder,
  canDeletePurchaseOrder,
  canDeliverPurchaseOrder,
  canEditPurchaseOrder,
  canMarkReadyPurchaseOrder,
  canProcessPurchaseOrder,
  canRefundPurchaseOrder,
  canShipPurchaseOrder,
  canTakePhotoPurchaseOrder,
  canViewPurchaseOrder,
} from '@/utils/permission.utils';
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
    deletePurchaseOrder,
    clearError,
  } = usePOActions();

  const { canEdit, canCreate, canTakePhoto } = useMemo(
    () => ({
      canEdit: canEditPurchaseOrder(permissions),
      canCreate: canCreatePurchaseOrder(permissions),
      canTakePhoto: canTakePhotoPurchaseOrder(permissions),
    }),
    [permissions],
  );

  // Use the centralized modal hook
  const { modals, selectedPO, closeModal, handlers } = usePOModals();
  const { uploadPhotos } = usePOActions();

  // Delivery modal state
  const [deliveryModalOpened, setDeliveryModalOpened] = useState(false);

  // Memoized modal close handler
  const handleCloseModal = useCallback(
    (
      modalType:
        | 'confirm'
        | 'process'
        | 'markReady'
        | 'ship'
        | 'deliver'
        | 'cancel'
        | 'refund'
        | 'delete'
        | 'uploadPhotos',
    ) =>
      () =>
        closeModal(modalType),
    [closeModal],
  );

  const handleEdit = () => {
    if (purchaseOrder && isPOEditable(purchaseOrder) && canEdit) {
      navigate(getPOEditRoute(purchaseOrder.id));
    }
  };

  const handleCopy = () => {
    if (purchaseOrder && canCreate) {
      // Navigate to create page with PO data as state
      navigate(ROUTERS.PO_ADD, {
        state: {
          copyFrom: {
            customerId: purchaseOrder.customerId,
            salesId: purchaseOrder.salesId,
            items: purchaseOrder.items,
            shippingAddress: {
              oneLineAddress: purchaseOrder.address,
              googleMapsUrl: purchaseOrder.googleMapsUrl,
            },
            notes: purchaseOrder.notes,
            isUrgentPO: purchaseOrder.isUrgentPO,
            isInternalDelivery: purchaseOrder.isInternalDelivery,
            customerPONumber: purchaseOrder.customerPONumber,
            poTags: purchaseOrder.poTags,
            isPersonalCustomer: purchaseOrder.isPersonalCustomer,
            personalCustomerName: purchaseOrder.personalCustomerName,
          },
        },
      });
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

  const handleDelete = () => {
    if (purchaseOrder) {
      handlers.handleDelete(purchaseOrder);
    }
  };

  const handleCreateDelivery = () => {
    if (purchaseOrder) {
      setDeliveryModalOpened(true);
    }
  };

  const handleTakePhoto = () => {
    if (purchaseOrder) {
      handlers.handleTakePhoto(purchaseOrder);
    }
  };

  const confirmPOAction = useSWRAction(
    'confirm-po',
    async () => {
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      if (!canConfirmPurchaseOrder(permissions)) {
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
      if (!canProcessPurchaseOrder(permissions)) {
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
      if (!canMarkReadyPurchaseOrder(permissions)) {
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
      if (!canShipPurchaseOrder(permissions)) {
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
      if (!canDeliverPurchaseOrder(permissions)) {
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
      if (!canCancelPurchaseOrder(permissions)) {
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
      if (!canRefundPurchaseOrder(permissions)) {
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

  const deletePOAction = useSWRAction(
    'delete-po',
    async () => {
      if (!canDeletePurchaseOrder(permissions)) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedPO) {
        throw new Error(t('common.invalidFormData'));
      }
      await deletePurchaseOrder(selectedPO.id);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.deleted'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.deleteFailed'),
      },
      onSuccess: () => {
        closeModal('delete');
        navigate(ROUTERS.PO_MANAGEMENT);
      },
    },
  );

  const { createDeliveryRequest } = useDeliveryRequestActions();

  // Upload photos action
  const uploadPhotosAction = useSWRAction(
    'upload-photos',
    async (data?: { photos: { publicUrl: string; key: string }[] }) => {
      // Note: No permission check as per requirement (anyone can take photo)
      if (!selectedPO || !data?.photos) {
        throw new Error(t('common.invalidFormData'));
      }
      await uploadPhotos(selectedPO.id, data.photos);
      closeModal('uploadPhotos');
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.photosUploaded'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('common.messages.uploadFailed'),
      },
    },
  );

  const createDeliveryAction = useSWRAction<
    | { assignedTo: string; scheduledDate: string; notes?: string; isUrgentDelivery?: boolean }
    | undefined
  >(
    'create-delivery-request',
    async (data) => {
      if (!canShipPurchaseOrder(permissions)) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!canCreate) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!data || !purchaseOrder) {
        throw new Error(t('common.invalidFormData'));
      }
      await createDeliveryRequest({
        purchaseOrderId: purchaseOrder.id,
        assignedTo: data.assignedTo,
        scheduledDate: data.scheduledDate,
        type: 'DELIVERY',
        notes: data.notes,
        isUrgentDelivery: data.isUrgentDelivery,
      });
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('po.deliveryRequestCreated'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('po.deliveryRequestCreateFailed'),
      },
      onSuccess: async () => {
        if (poId) {
          // Reload PO
          void (await loadPO(poId));
        }
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
        isLoading={confirmPOAction.isMutating}
        onClose={handleCloseModal('confirm')}
        onConfirm={async () => {
          await confirmPOAction.trigger();
        }}
      />
      <POStatusModal
        opened={modals.processModalOpened}
        purchaseOrder={selectedPO}
        mode="process"
        isLoading={processPOAction.isMutating}
        onClose={handleCloseModal('process')}
        onConfirm={async () => {
          await processPOAction.trigger();
        }}
      />
      <POStatusModal
        opened={modals.markReadyModalOpened}
        purchaseOrder={selectedPO}
        mode="markReady"
        isLoading={markReadyPOAction.isMutating}
        onClose={handleCloseModal('markReady')}
        onConfirm={markReadyPOAction.trigger}
      />
      <POStatusModal
        opened={modals.shipModalOpened}
        purchaseOrder={selectedPO}
        mode="ship"
        isLoading={shipPOAction.isMutating}
        onClose={handleCloseModal('ship')}
        onConfirm={shipPOAction.trigger}
      />
      <POStatusModal
        opened={modals.deliverModalOpened}
        purchaseOrder={selectedPO}
        mode="deliver"
        isLoading={deliverPOAction.isMutating}
        onClose={handleCloseModal('deliver')}
        onConfirm={deliverPOAction.trigger}
      />
      <POStatusModal
        opened={modals.cancelModalOpened}
        purchaseOrder={selectedPO}
        mode="cancel"
        isLoading={cancelPOAction.isMutating}
        onClose={handleCloseModal('cancel')}
        onConfirm={cancelPOAction.trigger}
      />
      <POStatusModal
        opened={modals.refundModalOpened}
        purchaseOrder={selectedPO}
        mode="refund"
        isLoading={refundPOAction.isMutating}
        onClose={handleCloseModal('refund')}
        onConfirm={refundPOAction.trigger}
      />
      <POStatusModal
        opened={modals.deleteModalOpened}
        purchaseOrder={selectedPO}
        mode="delete"
        isLoading={deletePOAction.isMutating}
        onClose={handleCloseModal('delete')}
        onConfirm={async () => {
          await deletePOAction.trigger();
        }}
      />
      <DeliveryRequestModal
        opened={deliveryModalOpened}
        purchaseOrder={purchaseOrder}
        isLoading={createDeliveryAction.isMutating}
        onClose={() => setDeliveryModalOpened(false)}
        onConfirm={createDeliveryAction.trigger}
      />
      <POPhotoUpload
        opened={modals.uploadPhotosModalOpened}
        onClose={handleCloseModal('uploadPhotos')}
        onUpload={uploadPhotosAction.trigger}
      />
    </>
  );

  const title = purchaseOrder ? purchaseOrder.poNumber : t('po.poDetails');

  // Show edit button when PO is editable (status = NEW) - moved before early returns
  const isEditable = purchaseOrder && isPOEditable(purchaseOrder);
  const canCopy = purchaseOrder && canCreate;

  if (!canViewPurchaseOrder(permissions)) {
    return <PermissionDeniedPage />;
  }

  if (isMobile) {
    if (isLoading || !purchaseOrder) {
      return (
        <AppMobileLayout
          showLogo
          isLoading={isLoading}
          error={error}
          noFooter
          withGoBack
          goBackRoute={ROUTERS.PO_MANAGEMENT}
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
        goBackRoute={ROUTERS.PO_MANAGEMENT}
        noFooter
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={title} />}
      >
        <Stack gap="md" style={{ position: 'relative' }} h="100%">
          <PODetailAccordion
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
            onDelete={handleDelete}
            onCreateDelivery={handleCreateDelivery}
          />
          {!modals.uploadPhotosModalOpened && (
            <Affix w="100%" position={{ bottom: 0 }} m="0" bg="white">
              <Group justify="end" m="sm">
                {canTakePhoto && (
                  <Button
                    leftSection={<IconCamera size={16} />}
                    variant="outline"
                    size="xs"
                    onClick={handleTakePhoto}
                    disabled={isLoading}
                  >
                    {t('common.photos.takePhoto')}
                  </Button>
                )}
                {canCopy && (
                  <Button
                    key="copy"
                    variant="filled"
                    color="orange"
                    size="xs"
                    m={1}
                    loading={isLoading}
                    disabled={!canCopy}
                    leftSection={<IconCopy size={14} />}
                    onClick={handleCopy}
                  >
                    {t('common.copy')}
                  </Button>
                )}
              </Group>
            </Affix>
          )}
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
        buttons={
          purchaseOrder
            ? ([
                ...(isEditable
                  ? [
                      {
                        label: t('common.edit'),
                        onClick: handleEdit,
                        disabled: !canEdit,
                        icon: <IconEdit size={16} />,
                      },
                    ]
                  : []),
                ...(canCopy
                  ? [
                      {
                        label: t('common.copy'),
                        onClick: handleCopy,
                        disabled: !canCreate,
                        icon: <IconCopy size={16} />,
                        variant: 'filled' as const,
                        color: 'orange',
                      },
                    ]
                  : []),
              ].filter(Boolean) as any)
            : undefined
        }
      />

      {isLoading ? (
        <PODetailTabsSkeleton />
      ) : purchaseOrder ? (
        <POErrorBoundary componentName="PODetailTabs">
          <PODetailTabs
            purchaseOrder={purchaseOrder}
            isLoading={isLoading}
            onConfirm={handleConfirm}
            onProcess={handleProcess}
            onMarkReady={handleMarkReady}
            onShip={handleShip}
            onDeliver={handleDeliver}
            onCancel={handleCancel}
            onRefund={handleRefund}
            onDelete={handleDelete}
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
