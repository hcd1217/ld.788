import { useCallback, useEffect, useMemo } from 'react';

import { useNavigate, useParams } from 'react-router';

import { Button, Group, LoadingOverlay, Modal, Stack, Text } from '@mantine/core';

import { DeliveryDetailAccordion } from '@/components/app/delivery/DeliveryDetailAccordion';
import { DeliveryDetailTabs } from '@/components/app/delivery/DeliveryDetailTabs';
import { DeliveryPhotoUpload } from '@/components/app/delivery/DeliveryPhotoUpload';
import { DeliveryStatusDrawer } from '@/components/app/delivery/DeliveryStatusDrawer';
import { DeliveryUpdateModal } from '@/components/app/delivery/DeliveryUpdateModal';
import { AppDesktopLayout, AppMobileLayout } from '@/components/common';
import { AppPageTitle } from '@/components/common';
import { PermissionDeniedPage } from '@/components/common/layouts/PermissionDeniedPage';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { ROUTERS } from '@/config/routeConfig';
import { useDeliveryModals } from '@/hooks/useDeliveryModals';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import { usePermissions } from '@/stores/useAppStore';
import {
  useCurrentDeliveryRequest,
  useDeliveryRequestActions,
  useDeliveryRequestError,
  useDeliveryRequestLoading,
} from '@/stores/useDeliveryRequestStore';
import type { UploadPhoto } from '@/types';
import {
  canCompleteDeliveryRequest,
  canDeleteDeliveryRequest,
  canEditDeliveryRequest,
  canStartTransitDeliveryRequest,
  canTakePhotoDeliveryRequest,
  canViewDeliveryRequest,
} from '@/utils/permission.utils';

export function DeliveryDetailPage() {
  const navigate = useNavigate();
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();

  const { canView, canEdit, canStartTransit, canComplete, canTakePhoto, canDelete } = useMemo(
    () => ({
      canView: canViewDeliveryRequest(permissions),
      canEdit: canEditDeliveryRequest(permissions),
      canStartTransit: canStartTransitDeliveryRequest(permissions),
      canComplete: canCompleteDeliveryRequest(permissions),
      canTakePhoto: canTakePhotoDeliveryRequest(permissions),
      canDelete: canDeleteDeliveryRequest(permissions),
    }),
    [permissions],
  );

  // Store selectors
  const deliveryRequest = useCurrentDeliveryRequest();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();

  // Store actions
  const {
    loadDeliveryRequest,
    clearError,
    updateDeliveryRequest,
    completeDelivery,
    startTransit,
    uploadPhotos,
    deleteDeliveryRequest,
  } = useDeliveryRequestActions();

  // Modal management
  const { modals, openModal, closeModal } = useDeliveryModals();

  // Load delivery request on mount
  useEffect(() => {
    if (deliveryId) {
      void loadDeliveryRequest(deliveryId);
    }
  }, [deliveryId, loadDeliveryRequest]);

  // Generic modal handler
  const handleOpenModal = useCallback(
    (modalType: keyof typeof modals) => () => {
      if (deliveryRequest) {
        openModal(modalType);
      }
    },
    [deliveryRequest, openModal],
  );

  // Start transit action
  const startTransitAction = useSWRAction(
    'start-transit',
    async (data?: { transitNotes?: string }) => {
      if (!canStartTransit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!deliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await startTransit(deliveryRequest.id, {
        transitNotes: data?.transitNotes,
      });

      closeModal('startTransit');
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.statusUpdated', {
          status: t('delivery.statuses.inTransit'),
        }),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('delivery.messages.statusUpdateFailed'),
      },
    },
  );

  // Complete delivery action
  const completeDeliveryAction = useSWRAction(
    'complete-delivery',
    async (data: { photos: UploadPhoto[]; deliveryNotes: string; receivedBy: string }) => {
      if (!canComplete) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!deliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await completeDelivery(deliveryRequest.id, data);
      closeModal('complete');
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.completed'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('delivery.messages.completeFailed'),
      },
    },
  );

  // Upload photos action
  const uploadPhotosAction = useSWRAction(
    'upload-photos',
    async (data?: { photos: { publicUrl: string; key: string }[] }) => {
      if (!canTakePhoto) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!deliveryRequest || !data?.photos) {
        throw new Error(t('common.invalidFormData'));
      }
      await uploadPhotos(deliveryRequest.id, data.photos);
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

  // Update delivery request action
  const updateDeliveryRequestAction = useSWRAction(
    'update-delivery-request',
    async (data?: {
      assignedTo?: string;
      scheduledDate?: string;
      notes?: string;
      isUrgentDelivery?: boolean;
      vendorName?: string;
      deliveryAddress?: {
        oneLineAddress?: string;
        googleMapsUrl?: string;
      };
      receiveAddress?: {
        oneLineAddress?: string;
        googleMapsUrl?: string;
      };
    }) => {
      if (!canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!deliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await updateDeliveryRequest(deliveryRequest.id, {
        assignedTo: data?.assignedTo,
        scheduledDate: data?.scheduledDate,
        type: deliveryRequest.type,
        notes: data?.notes,
        isUrgentDelivery: data?.isUrgentDelivery,
        vendorName: data?.vendorName,
        receiveAddress: data?.receiveAddress,
        deliveryAddress: data?.deliveryAddress,
      });
      closeModal('update');
    },
  );

  // Delete delivery request action
  const deleteDeliveryRequestAction = useSWRAction(
    'delete-delivery-request',
    async () => {
      if (!canDelete) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!deliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await deleteDeliveryRequest(deliveryRequest.id);
      closeModal('delete');
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.deleted'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('delivery.messages.deleteFailed'),
      },
      onSuccess: () => {
        navigate(ROUTERS.DELIVERY_MANAGEMENT);
      },
    },
  );

  const title = deliveryRequest?.deliveryRequestNumber ?? t('delivery.detail');

  // Check view permission
  if (!canView) {
    return <PermissionDeniedPage />;
  }

  // Mobile layout
  if (isMobile) {
    return (
      <AppMobileLayout
        withGoBack={!!deliveryRequest}
        showLogo={!deliveryRequest}
        noFooter={!!deliveryRequest}
        isLoading={isLoading}
        error={error}
        clearError={clearError}
        header={<AppPageTitle title={title} />}
      >
        {isLoading ? (
          <LoadingOverlay visible />
        ) : !deliveryRequest ? (
          <ResourceNotFound withGoBack message={t('delivery.notFound')} />
        ) : (
          <>
            <Stack gap="md">
              <DeliveryDetailAccordion
                deliveryRequest={deliveryRequest}
                isLoading={isLoading}
                onComplete={handleOpenModal('complete')}
                onTakePhoto={handleOpenModal('uploadPhotos')}
                onUpdate={handleOpenModal('update')}
                onStartTransit={handleOpenModal('startTransit')}
                onDelete={handleOpenModal('delete')}
              />
            </Stack>

            {/* Modal components */}
            <DeliveryStatusDrawer
              opened={modals.startTransit}
              mode="start_transit"
              deliveryRequest={deliveryRequest}
              onClose={() => closeModal('startTransit')}
              onConfirm={startTransitAction.trigger}
            />
            <DeliveryStatusDrawer
              opened={modals.complete}
              mode="complete"
              deliveryRequest={deliveryRequest}
              onClose={() => closeModal('complete')}
              onComplete={completeDeliveryAction.trigger}
            />
            <DeliveryPhotoUpload
              opened={modals.uploadPhotos}
              onClose={() => closeModal('uploadPhotos')}
              onUpload={uploadPhotosAction.trigger}
            />
            <DeliveryUpdateModal
              opened={modals.update}
              deliveryRequest={deliveryRequest}
              onClose={() => closeModal('update')}
              onConfirm={updateDeliveryRequestAction.trigger}
            />
            <Modal
              opened={modals.delete}
              onClose={() => closeModal('delete')}
              title={t('delivery.deleteDelivery')}
              centered
            >
              <Stack>
                <Text>{t('delivery.deleteDeliveryDescription')}</Text>
                <Group justify="flex-end" mt="md">
                  <Button variant="default" onClick={() => closeModal('delete')}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    color="red"
                    onClick={() => deleteDeliveryRequestAction.trigger()}
                    loading={deleteDeliveryRequestAction.isMutating}
                  >
                    {t('common.delete')}
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </>
        )}
      </AppMobileLayout>
    );
  }

  // Desktop layout
  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle withGoBack route={ROUTERS.DELIVERY_MANAGEMENT} title={title} />
      {isLoading ? (
        <LoadingOverlay visible />
      ) : deliveryRequest ? (
        <>
          <DeliveryDetailTabs
            deliveryRequest={deliveryRequest}
            isLoading={isLoading}
            onUpdate={handleOpenModal('update')}
            onDelete={handleOpenModal('delete')}
          />
          <DeliveryUpdateModal
            opened={modals.update}
            deliveryRequest={deliveryRequest}
            onClose={() => closeModal('update')}
            onConfirm={updateDeliveryRequestAction.trigger}
          />
          <Modal
            opened={modals.delete}
            onClose={() => closeModal('delete')}
            title={t('delivery.deleteDelivery')}
            centered
          >
            <Stack>
              <Text>{t('delivery.deleteDeliveryDescription')}</Text>
              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => closeModal('delete')}>
                  {t('common.cancel')}
                </Button>
                <Button
                  color="red"
                  onClick={() => deleteDeliveryRequestAction.trigger()}
                  loading={deleteDeliveryRequestAction.isMutating}
                >
                  {t('common.delete')}
                </Button>
              </Group>
            </Stack>
          </Modal>
        </>
      ) : (
        <ResourceNotFound message={t('delivery.notFound')} />
      )}
    </AppDesktopLayout>
  );
}
