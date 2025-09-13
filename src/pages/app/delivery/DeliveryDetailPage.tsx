import { useCallback, useEffect } from 'react';

import { useParams } from 'react-router';

import { LoadingOverlay, Stack } from '@mantine/core';

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
import type { PICType } from '@/services/sales/deliveryRequest';
import { usePermissions } from '@/stores/useAppStore';
import {
  useCurrentDeliveryRequest,
  useDeliveryRequestActions,
  useDeliveryRequestError,
  useDeliveryRequestLoading,
} from '@/stores/useDeliveryRequestStore';

export function DeliveryDetailPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const permissions = usePermissions();

  // Store selectors
  const deliveryRequest = useCurrentDeliveryRequest();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();

  // Store actions
  const {
    loadDeliveryRequest,
    clearError,
    updateDeliveryRequest,
    updateDeliveryStatus,
    completeDelivery,
    uploadPhotos,
  } = useDeliveryRequestActions();

  // Modal management
  const { modals, selectedDeliveryRequest, closeModal, handlers } = useDeliveryModals();

  // Load delivery request on mount
  useEffect(() => {
    if (deliveryId) {
      void loadDeliveryRequest(deliveryId);
    }
  }, [deliveryId, loadDeliveryRequest]);

  // Memoized modal close handlers
  const handleCloseModal = useCallback(
    (modalType: 'startTransit' | 'complete' | 'uploadPhotos' | 'update') => () =>
      closeModal(modalType),
    [closeModal],
  );

  // Action handlers
  const handleStartTransit = () => {
    if (deliveryRequest) {
      handlers.handleStartTransit(deliveryRequest);
    }
  };

  const handleComplete = () => {
    if (deliveryRequest) {
      handlers.handleComplete(deliveryRequest);
    }
  };

  const handleTakeDeliveryPhoto = () => {
    if (deliveryRequest) {
      handlers.handleTakeDeliveryPhoto(deliveryRequest);
    }
  };

  const handleUpdate = () => {
    if (deliveryRequest) {
      handlers.handleUpdate(deliveryRequest);
    }
  };

  // Start transit action
  const startTransitAction = useSWRAction(
    'start-transit',
    async (data?: { transitNotes?: string }) => {
      if (!permissions.deliveryRequest.actions?.canStartTransit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedDeliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await updateDeliveryStatus(selectedDeliveryRequest.id, 'IN_TRANSIT', data?.transitNotes);
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
    async (data?: { completionNotes?: string; recipient?: string }) => {
      if (!permissions.deliveryRequest.actions?.canComplete) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedDeliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await completeDelivery(selectedDeliveryRequest.id, {
        notes: data?.completionNotes,
      });
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
    async (data?: { photoUrls: string[] }) => {
      if (!permissions.deliveryRequest.actions?.canTakePhoto) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedDeliveryRequest || !data?.photoUrls) {
        throw new Error(t('common.invalidFormData'));
      }
      await uploadPhotos(selectedDeliveryRequest.id, data.photoUrls);
      closeModal('uploadPhotos');
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.photosUploaded'),
        errorTitle: t('common.errors.notificationTitle'),
        errorMessage: t('delivery.messages.uploadFailed'),
      },
    },
  );

  // Update delivery request action
  const updateDeliveryRequestAction = useSWRAction(
    'update-delivery-request',
    async (data?: {
      assignedTo?: string;
      assignedType?: PICType;
      scheduledDate?: string;
      notes?: string;
      isUrgentDelivery?: boolean;
    }) => {
      if (!permissions.deliveryRequest.canEdit) {
        throw new Error(t('common.doNotHavePermissionForAction'));
      }
      if (!selectedDeliveryRequest) {
        throw new Error(t('common.invalidFormData'));
      }
      await updateDeliveryRequest(selectedDeliveryRequest.id, {
        assignedTo: data?.assignedTo,
        assignedType: data?.assignedType,
        scheduledDate: data?.scheduledDate,
        notes: data?.notes,
        isUrgentDelivery: data?.isUrgentDelivery,
      });
      closeModal('update');
    },
  );

  const title = deliveryRequest
    ? `${deliveryRequest.deliveryRequestNumber}`
    : t('delivery.detail.title');

  // Check view permission
  if (!permissions.deliveryRequest.canView) {
    return <PermissionDeniedPage />;
  }

  // Mobile layout
  if (isMobile) {
    if (isLoading || !deliveryRequest) {
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
            <ResourceNotFound withGoBack message={t('delivery.notFound')} />
          )}
        </AppMobileLayout>
      );
    }

    if (modals.uploadPhotos) {
      return (
        <DeliveryPhotoUpload
          opened={modals.uploadPhotos}
          onClose={handleCloseModal('uploadPhotos')}
          onUpload={uploadPhotosAction.trigger}
        />
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
          <DeliveryDetailAccordion
            canEdit={permissions.deliveryRequest.canEdit}
            deliveryRequest={deliveryRequest}
            isLoading={isLoading}
            canStartTransit={permissions.deliveryRequest.actions?.canStartTransit}
            canComplete={permissions.deliveryRequest.actions?.canComplete}
            canTakePhoto={permissions.deliveryRequest.actions?.canTakePhoto}
            onStartTransit={handleStartTransit}
            onComplete={handleComplete}
            onTakePhoto={handleTakeDeliveryPhoto}
            onUpdate={handleUpdate}
          />
        </Stack>

        {/* Drawer components */}
        <DeliveryStatusDrawer
          opened={modals.startTransit}
          mode="start_transit"
          deliveryRequest={selectedDeliveryRequest}
          onClose={handleCloseModal('startTransit')}
          onConfirm={startTransitAction.trigger}
        />
        <DeliveryStatusDrawer
          opened={modals.complete}
          mode="complete"
          deliveryRequest={selectedDeliveryRequest}
          onClose={handleCloseModal('complete')}
          onConfirm={completeDeliveryAction.trigger}
        />
        <DeliveryUpdateModal
          opened={modals.update}
          deliveryRequest={selectedDeliveryRequest}
          onClose={handleCloseModal('update')}
          onConfirm={updateDeliveryRequestAction.trigger}
        />
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
            canEdit={permissions.deliveryRequest.canEdit}
            onUpdate={handleUpdate}
          />
          <DeliveryUpdateModal
            opened={modals.update}
            deliveryRequest={selectedDeliveryRequest}
            onClose={handleCloseModal('update')}
            onConfirm={updateDeliveryRequestAction.trigger}
          />
        </>
      ) : (
        <ResourceNotFound message={t('delivery.notFound')} />
      )}
    </AppDesktopLayout>
  );
}
