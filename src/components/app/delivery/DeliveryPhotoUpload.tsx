import { useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { showErrorNotification } from '@/utils/notifications';
import { logError } from '@/utils/logger';
import { uploadBase64ToS3 } from '@/utils/mediaUpload';
import { PhotoCapture } from '@/components/common/features/PhotoCapture';

type DeliveryPhotoUploadProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onUpload: (data: { photoUrls: string[] }) => Promise<void>;
};

export function DeliveryPhotoUpload({ opened, onClose, onUpload }: DeliveryPhotoUploadProps) {
  const { t } = useTranslation();

  // Handle photo capture, upload to S3, save to backend, and close
  const handlePhotoCapture = useCallback(
    async (capturedPhoto: string) => {
      try {
        // Step 1: Upload to S3
        const uploadedUrl = await uploadBase64ToS3(capturedPhoto, {
          fileName: `delivery-photo-${Date.now()}.jpg`,
          fileType: 'image/jpeg',
          purpose: 'DELIVERY_REQUEST_PHOTO',
          prefix: 'delivery',
        });

        if (uploadedUrl) {
          // Step 2: Save to backend
          await onUpload({ photoUrls: [uploadedUrl] });
        }
      } catch (error) {
        logError('Failed to upload photo', error, {
          module: 'DeliveryPhotoUpload',
          action: 'handlePhotoCapture',
        });
        showErrorNotification(t('common.error'), t('delivery.messages.uploadFailed'));
        throw error; // Re-throw to prevent closing the modal
      }
    },
    [onUpload, t],
  );

  return <PhotoCapture opened={opened} onClose={onClose} onCapture={handlePhotoCapture} />;
}
