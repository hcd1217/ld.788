import { useCallback } from 'react';

import { PhotoCapture } from '@/components/common/features/PhotoCapture';
import { useTranslation } from '@/hooks/useTranslation';
import { logError } from '@/utils/logger';
import { uploadBase64ToS3 } from '@/utils/mediaUpload';
import { showErrorNotification } from '@/utils/notifications';

type DeliveryPhotoUploadProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onUpload: (data: { photos: { publicUrl: string; key: string }[] }) => Promise<void>;
};

export function DeliveryPhotoUpload({ opened, onClose, onUpload }: DeliveryPhotoUploadProps) {
  const { t } = useTranslation();

  // Handle photo capture, upload to S3, save to backend, and close
  const handlePhotoCapture = useCallback(
    async (capturedPhoto: string) => {
      try {
        // Step 1: Upload to S3
        const { publicUrl, key } = await uploadBase64ToS3(capturedPhoto, {
          fileName: `delivery-photo-${Date.now()}.jpg`,
          purpose: 'DELIVERY_REQUEST_PHOTO',
          prefix: 'delivery',
        });

        if (publicUrl) {
          // Step 2: Save to backend
          await onUpload({ photos: [{ publicUrl, key }] });
        }
      } catch (error) {
        logError('Failed to upload photo', error, {
          module: 'DeliveryPhotoUpload',
          action: 'handlePhotoCapture',
        });
        showErrorNotification(
          t('common.errors.notificationTitle'),
          t('common.messages.uploadFailed'),
        );
        throw error; // Re-throw to prevent closing the modal
      }
    },
    [onUpload, t],
  );

  return <PhotoCapture opened={opened} onClose={onClose} onCapture={handlePhotoCapture} />;
}
