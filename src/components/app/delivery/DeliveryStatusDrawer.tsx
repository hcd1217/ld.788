import { useMemo, useState } from 'react';

import {
  Alert,
  Button,
  Drawer,
  Grid,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconAlertTriangle, IconCamera, IconCheck, IconTruck } from '@tabler/icons-react';

import { DRAWER_BODY_PADDING_BOTTOM, DRAWER_HEADER_PADDING } from '@/constants/po.constants';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useSWRAction } from '@/hooks/useSWRAction';
import { useTranslation } from '@/hooks/useTranslation';
import type { DeliveryRequest } from '@/services/sales/deliveryRequest';
import { usePermissions } from '@/stores/useAppStore';
import { useDeliveryRequestActions } from '@/stores/useDeliveryRequestStore';
import { formatDate } from '@/utils/time';

import { DeliveryPhotoUpload } from './DeliveryPhotoUpload';

export type DeliveryModalMode = 'start_transit' | 'complete';

type DeliveryStatusDrawerProps = {
  readonly opened: boolean;
  readonly mode: DeliveryModalMode;
  readonly deliveryRequest?: DeliveryRequest;
  readonly onClose: () => void;
  readonly onConfirm: (data?: any) => Promise<void>;
};

// Modal configuration based on mode
const getModalConfig = (mode: DeliveryModalMode, t: any) => {
  const configs = {
    start_transit: {
      title: t('delivery.actions.startTransit'),
      description: t('delivery.actions.startTransitDescription'),
      buttonText: t('delivery.actions.startTransit'),
      buttonColor: 'orange',
      icon: <IconTruck size={16} />,
      alertColor: 'orange',
      requiresNotes: false,
    },
    complete: {
      title: t('delivery.completeDelivery'),
      description: t('delivery.completeDeliveryDescription'),
      buttonText: t('delivery.markAsCompleted'),
      buttonColor: 'red',
      icon: <IconCheck size={16} />,
      alertColor: 'red',
      requiresNotes: true,
      notesLabel: t('delivery.completionNotes'),
      notesPlaceholder: t('delivery.enterCompletionNotes'),
    },
  };

  return configs[mode];
};

export function DeliveryStatusDrawer({
  opened,
  mode,
  deliveryRequest,
  onClose,
  onConfirm,
}: DeliveryStatusDrawerProps) {
  const { t } = useTranslation();
  const { isDesktop } = useDeviceType();
  const [notes, setNotes] = useState('');
  const [recipient, setRecipient] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(deliveryRequest?.photoUrls || []);
  const permissions = usePermissions();
  const { uploadPhotos } = useDeliveryRequestActions();
  const isComplete = mode === 'complete';

  // Get modal configuration - memoized
  const config = useMemo(() => getModalConfig(mode, t), [mode, t]);

  // Upload photos action using SWR
  const uploadPhotosAction = useSWRAction(
    // Unique key that includes the delivery request ID for proper caching
    deliveryRequest ? `upload-photos-${deliveryRequest.id}` : 'upload-photos',
    async (data: { photoUrls: string[] }) => {
      // Validation
      if (!permissions.deliveryRequest.actions?.canTakePhoto) {
        throw new Error(t('delivery.messages.uploadFailed'));
      }
      if (!deliveryRequest || !data?.photoUrls || data.photoUrls.length === 0) {
        throw new Error(t('delivery.messages.uploadFailed'));
      }

      // Perform the upload
      return await uploadPhotos(deliveryRequest.id, data.photoUrls);
    },
    {
      notifications: {
        successTitle: t('common.success'),
        successMessage: t('delivery.messages.photosUploaded'),
        errorTitle: t('common.error'),
        errorMessage: t('delivery.messages.uploadFailed'),
      },
      onSuccess: () => {
        // Update the local state only after successful upload
        // Note: We're not using the returned data here since uploadPhotos might return void
        setShowPhotoUpload(false);
      },
    },
  );

  const handlePhotoUpload = async (data: { photoUrls: string[] }) => {
    // Simply trigger the upload action
    // Update state after successful upload
    await uploadPhotosAction.trigger(data);
    // Only update photos if the upload was successful (no error thrown)
    setUploadedPhotos((prev) => [...prev, ...data.photoUrls]);
  };

  const handleConfirm = async () => {
    let data: any = undefined;

    if (mode === 'start_transit') {
      data = {
        transitNotes: notes.trim(),
        startedAt: new Date().toISOString(),
        photoUrls: uploadedPhotos,
      };
    } else if (mode === 'complete') {
      data = {
        completionNotes: notes.trim(),
        recipient: recipient.trim(),
        deliveredAt: deliveryTime || new Date().toISOString(),
        photoUrls: uploadedPhotos,
      };
    }

    await onConfirm(data);
    handleClose();
  };

  const handleClose = () => {
    setNotes('');
    setRecipient('');
    setDeliveryTime('');
    setUploadedPhotos([]);
    setShowPhotoUpload(false);
    onClose();
  };

  // Check if confirm button should be disabled
  const isConfirmDisabled = () => {
    if (isComplete) {
      return uploadedPhotos.length === 0 || !notes.trim() || !recipient.trim();
    }
    return false;
  };

  if (!deliveryRequest) return null;

  if (isDesktop) {
    return null;
  }

  if (showPhotoUpload) {
    return (
      <DeliveryPhotoUpload
        opened={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onUpload={handlePhotoUpload}
      />
    );
  }

  return (
    <>
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={config.title}
        position="bottom"
        size="90%"
        trapFocus
        returnFocus
        styles={{
          body: { paddingBottom: DRAWER_BODY_PADDING_BOTTOM },
          header: { padding: DRAWER_HEADER_PADDING },
        }}
      >
        <ScrollArea h="calc(90% - 80px)" type="never">
          <Stack gap="md">
            <Alert icon={<IconAlertTriangle size={16} />} color={config.alertColor} variant="light">
              {config.description}
            </Alert>

            <div>
              <Text fw={500} mb="xs">
                {t('delivery.deliveryDetails')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('delivery.deliveryId')}: {deliveryRequest.deliveryRequestNumber}
              </Text>
              <Text size="sm" c="dimmed">
                {t('delivery.customerName')}: {deliveryRequest.customerName}
              </Text>
              {deliveryRequest.scheduledDate && (
                <Text size="sm" c="dimmed">
                  {t('delivery.scheduledDate')}: {formatDate(deliveryRequest.scheduledDate)}
                </Text>
              )}
            </div>

            {!isComplete && (
              <Textarea
                label={t('delivery.transitNotes')}
                placeholder={t('delivery.enterTransitNotes')}
                value={notes}
                onChange={(event) => setNotes(event.currentTarget.value)}
                rows={3}
                description={t('delivery.transitNotesDescription')}
              />
            )}

            {isComplete && (
              <>
                <Text size="sm" fw={500} mb="xs">
                  {t('delivery.detail.photos')}
                </Text>

                {/* Display uploaded photos */}
                {uploadedPhotos.length > 0 && (
                  <>
                    <Grid mb="xs">
                      {uploadedPhotos.map((url, index) => (
                        <Grid.Col key={index} span={4}>
                          <Image
                            src={url}
                            alt={`Photo ${index + 1}`}
                            height={80}
                            fit="cover"
                            radius="sm"
                            fallbackSrc="/photos/no-photo.svg"
                          />
                        </Grid.Col>
                      ))}
                    </Grid>
                    <Text size="xs" c="dimmed" mb="xs">
                      {uploadedPhotos.length} {uploadedPhotos.length === 1 ? 'photo' : 'photos'}{' '}
                      uploaded
                    </Text>
                  </>
                )}

                <Button
                  variant="light"
                  leftSection={<IconCamera size={16} />}
                  onClick={() => setShowPhotoUpload(true)}
                  loading={uploadPhotosAction.isMutating}
                  disabled={uploadPhotosAction.isMutating}
                >
                  {t('common.photos.takePhoto')}
                </Button>
                <TextInput
                  label={t('delivery.recipient')}
                  placeholder={t('delivery.enterRecipientName')}
                  value={recipient}
                  onChange={(event) => setRecipient(event.currentTarget.value)}
                  required
                  description={t('delivery.recipientDescription')}
                />
                <Textarea
                  label={t('delivery.completionNotes')}
                  placeholder={t('delivery.enterCompletionNotes')}
                  value={notes}
                  onChange={(event) => setNotes(event.currentTarget.value)}
                  rows={3}
                  required
                  description={t('delivery.completionNotesDescription')}
                />
              </>
            )}

            {isComplete && uploadedPhotos.length === 0 && (
              <Text size="xs" c="red" ta="center">
                {t('delivery.detail.photosRequired')}
              </Text>
            )}

            <Group justify="flex-end">
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel')}
              </Button>
              <Button
                color={config.buttonColor}
                leftSection={config.icon}
                onClick={handleConfirm}
                disabled={isConfirmDisabled()}
              >
                {config.buttonText}
              </Button>
            </Group>
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  );
}
