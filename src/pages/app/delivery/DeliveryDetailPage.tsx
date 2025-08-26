import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router';
import { LoadingOverlay, Stack } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useAction } from '@/hooks/useAction';
import {
  useCurrentDeliveryRequest,
  useDeliveryRequestLoading,
  useDeliveryRequestError,
  useLoadDeliveryRequest,
  useClearDeliveryRequestError,
  useUpdateDeliveryStatus,
  useCompleteDelivery,
  useUploadPhotos,
} from '@/stores/useDeliveryRequestStore';
import { useDeliveryModals } from '@/hooks/useDeliveryModals';
import { ResourceNotFound } from '@/components/common/layouts/ResourceNotFound';
import { AppPageTitle } from '@/components/common';
import { AppMobileLayout, AppDesktopLayout } from '@/components/common';
import { DeliveryDetailTabs } from '@/components/app/delivery/DeliveryDetailTabs';
import { DeliveryDetailAccordion } from '@/components/app/delivery/DeliveryDetailAccordion';
import { DeliveryStatusModal } from '@/components/app/delivery/DeliveryStatusModal';
import { DeliveryPhotoUpload } from '@/components/app/delivery/DeliveryPhotoUpload';

export function DeliveryDetailPage() {
  const { deliveryId } = useParams<{ deliveryId: string }>();
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  // Store selectors
  const deliveryRequest = useCurrentDeliveryRequest();
  const isLoading = useDeliveryRequestLoading();
  const error = useDeliveryRequestError();

  // Store actions
  const loadDeliveryRequest = useLoadDeliveryRequest();
  const clearError = useClearDeliveryRequestError();
  const updateDeliveryStatus = useUpdateDeliveryStatus();
  const completeDelivery = useCompleteDelivery();
  const uploadPhotos = useUploadPhotos();

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
    (modalType: 'startTransit' | 'complete' | 'uploadPhotos') => () => closeModal(modalType),
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

  const handleUploadPhotos = () => {
    if (deliveryRequest) {
      handlers.handleUploadPhotos(deliveryRequest);
    }
  };

  // Start transit action
  const startTransitAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('delivery.messages.statusUpdated', {
        status: t('delivery.status.inTransit'),
      }),
      errorTitle: t('common.error'),
      errorMessage: t('delivery.messages.statusUpdateFailed'),
    },
    async actionHandler(data?: any) {
      if (!selectedDeliveryRequest) {
        throw new Error(t('delivery.messages.statusUpdateFailed'));
      }
      await updateDeliveryStatus(selectedDeliveryRequest.id, 'IN_TRANSIT', data?.transitNotes);
      closeModal('startTransit');
    },
  });

  // Complete delivery action
  const completeDeliveryAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('delivery.messages.completed'),
      errorTitle: t('common.error'),
      errorMessage: t('delivery.messages.completeFailed'),
    },
    async actionHandler(data?: { completionNotes?: string; recipient?: string }) {
      if (!selectedDeliveryRequest) {
        throw new Error(t('delivery.messages.completeFailed'));
      }
      await completeDelivery(selectedDeliveryRequest.id, {
        notes: data?.completionNotes,
        // recipient data would be handled by the backend
      });
      closeModal('complete');
    },
  });

  // Upload photos action
  const uploadPhotosAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('delivery.messages.photosUploaded'),
      errorTitle: t('common.error'),
      errorMessage: t('delivery.messages.uploadFailed'),
    },
    async actionHandler(data?: { photoUrls: string[] }) {
      if (!selectedDeliveryRequest || !data?.photoUrls) {
        throw new Error(t('delivery.messages.uploadFailed'));
      }
      await uploadPhotos(selectedDeliveryRequest.id, data.photoUrls);
      closeModal('uploadPhotos');
    },
  });

  const title = deliveryRequest
    ? `DR-${deliveryRequest.id.slice(-6)}`
    : t('delivery.detail.title' as any);

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
            deliveryRequest={deliveryRequest}
            isLoading={isLoading}
            onStartTransit={handleStartTransit}
            onComplete={handleComplete}
            onUploadPhotos={handleUploadPhotos}
          />
        </Stack>

        {/* Modal components */}
        <DeliveryStatusModal
          opened={modals.startTransit}
          mode="start_transit"
          deliveryRequest={selectedDeliveryRequest}
          onClose={handleCloseModal('startTransit')}
          onConfirm={startTransitAction}
        />
        <DeliveryStatusModal
          opened={modals.complete}
          mode="complete"
          deliveryRequest={selectedDeliveryRequest}
          onClose={handleCloseModal('complete')}
          onConfirm={completeDeliveryAction}
        />
        <DeliveryPhotoUpload
          opened={modals.uploadPhotos}
          onClose={handleCloseModal('uploadPhotos')}
          onUpload={uploadPhotosAction}
          existingPhotos={selectedDeliveryRequest?.photoUrls}
        />
      </AppMobileLayout>
    );
  }

  // Desktop layout
  return (
    <AppDesktopLayout isLoading={isLoading} error={error} clearError={clearError}>
      <AppPageTitle title={title} />

      {isLoading ? (
        <LoadingOverlay visible />
      ) : deliveryRequest ? (
        <DeliveryDetailTabs
          deliveryRequest={deliveryRequest}
          isLoading={isLoading}
          onStartTransit={handleStartTransit}
          onComplete={handleComplete}
          onUploadPhotos={handleUploadPhotos}
        />
      ) : (
        <ResourceNotFound message={t('delivery.notFound')} />
      )}

      {/* Modal components */}
      <DeliveryStatusModal
        opened={modals.startTransit}
        mode="start_transit"
        deliveryRequest={selectedDeliveryRequest}
        onClose={handleCloseModal('startTransit')}
        onConfirm={startTransitAction}
      />
      <DeliveryStatusModal
        opened={modals.complete}
        mode="complete"
        deliveryRequest={selectedDeliveryRequest}
        onClose={handleCloseModal('complete')}
        onConfirm={completeDeliveryAction}
      />
      <DeliveryPhotoUpload
        opened={modals.uploadPhotos}
        onClose={handleCloseModal('uploadPhotos')}
        onUpload={uploadPhotosAction}
        existingPhotos={selectedDeliveryRequest?.photoUrls}
      />
    </AppDesktopLayout>
  );
}
