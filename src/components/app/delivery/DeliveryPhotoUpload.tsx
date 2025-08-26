import { useRef, useState, useCallback } from 'react';
import {
  Modal,
  Drawer,
  ScrollArea,
  Text,
  Group,
  Button,
  Stack,
  Paper,
  Image,
  ActionIcon,
  Grid,
  Alert,
  Progress,
} from '@mantine/core';
import { IconCamera, IconUpload, IconX, IconPhoto, IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useAction } from '@/hooks/useAction';
import { showErrorNotification } from '@/utils/notifications';
import { DRAWER_BODY_PADDING_BOTTOM, DRAWER_HEADER_PADDING } from '@/constants/po.constants';
import { logError } from '@/utils/logger';

type DeliveryPhotoUploadProps = {
  readonly opened: boolean;
  readonly onClose: () => void;
  readonly onUpload: (data: { photoUrls: string[] }) => Promise<void>;
  readonly maxPhotos?: number;
  readonly existingPhotos?: string[];
};

const PHOTO_CONFIG = {
  quality: 0.8,
  maxWidth: 1024,
  maxHeight: 768,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

export function DeliveryPhotoUpload({
  opened,
  onClose,
  onUpload,
  maxPhotos = 5,
  existingPhotos = [],
}: DeliveryPhotoUploadProps) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadAction = useAction({
    options: {
      successTitle: t('common.success'),
      successMessage: t('delivery.messages.photosUploaded'),
      errorTitle: t('common.error'),
      errorMessage: t('delivery.messages.uploadFailed'),
    },
    async actionHandler(data?: { photoUrls: string[] }) {
      if (data?.photoUrls) {
        await onUpload(data);
      }
    },
  });

  // Validate file
  const validateFile = useCallback(
    (file: File): boolean => {
      if (!PHOTO_CONFIG.acceptedTypes.includes(file.type as any)) {
        showErrorNotification(t('common.error'), t('delivery.photos.invalidFileType'));
        return false;
      }

      if (file.size > PHOTO_CONFIG.maxFileSize) {
        showErrorNotification(t('common.error'), t('delivery.photos.fileTooLarge'));
        return false;
      }

      return true;
    },
    [t],
  );

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList) => {
      const validFiles: File[] = [];

      for (let i = 0; i < files.length && validFiles.length + photos.length < maxPhotos; i++) {
        const file = files[i];
        if (validateFile(file)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      try {
        const base64Photos = await Promise.all(validFiles.map((file) => fileToBase64(file)));

        setPhotos((prev) => [...prev, ...base64Photos]);

        if (validFiles.length < files.length) {
          showErrorNotification(t('common.error'), t('delivery.photos.someFilesSkipped'));
        }
      } catch (error) {
        logError('Failed to upload photos:', error, {
          module: 'DeliveryPhotoUpload',
          action: 'handleFileSelect',
        });
        showErrorNotification(t('common.error'), t('delivery.messages.uploadFailed'));
      }
    },
    [photos.length, maxPhotos, validateFile, fileToBase64, t],
  );

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: PHOTO_CONFIG.maxWidth },
          height: { ideal: PHOTO_CONFIG.maxHeight },
          facingMode: isMobile ? 'environment' : 'user', // Use back camera on mobile
        },
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      logError('Failed to start camera:', error, {
        module: 'DeliveryPhotoUpload',
        action: 'startCamera',
      });
      showErrorNotification(t('common.error'), t('timekeeper.clock.camera.permissionDenied'));
    }
  }, [isMobile, t]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, [stream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || photos.length >= maxPhotos) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert to base64 with compression
    const base64 = canvas.toDataURL('image/jpeg', PHOTO_CONFIG.quality);

    setPhotos((prev) => [...prev, base64]);
    stopCamera();
  }, [photos.length, maxPhotos, stopCamera]);

  // Remove photo
  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (photos.length === 0) {
      showErrorNotification(t('common.error'), t('delivery.photos.noPhotosSelected'));
      return;
    }

    setIsUploading(true);
    try {
      await uploadAction({ photoUrls: photos });
      onClose();
    } finally {
      setIsUploading(false);
    }
  }, [photos, uploadAction, onClose, t]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setPhotos(existingPhotos);
    onClose();
  }, [stopCamera, existingPhotos, onClose]);

  // File upload area
  const uploadArea = (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={{
        backgroundColor: isDragOver ? 'var(--mantine-color-gray-0)' : undefined,
        border: isDragOver
          ? '2px dashed var(--mantine-color-blue-5)'
          : '2px dashed var(--mantine-color-gray-3)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
          handleFileSelect(e.dataTransfer.files);
        }
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <Stack align="center" gap="md">
        <IconPhoto size={48} color="var(--mantine-color-gray-5)" />
        <div style={{ textAlign: 'center' }}>
          <Text size="lg" fw={500}>
            {t('common.dragAndDropFile')}
          </Text>
          <Text size="sm" c="dimmed">
            {t('common.orClickToSelect')}
          </Text>
        </div>
      </Stack>
    </Paper>
  );

  // Photo grid
  const photoGrid = photos.length > 0 && (
    <div>
      <Text fw={500} mb="sm">
        {t('delivery.detail.photos')} ({photos.length}/{maxPhotos})
      </Text>
      <Grid>
        {photos.map((photo, index) => (
          <Grid.Col span={6} key={index}>
            <Paper withBorder radius="md" pos="relative">
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                h={120}
                style={{ objectFit: 'cover' }}
                radius="md"
              />
              <ActionIcon
                variant="filled"
                color="red"
                size="sm"
                pos="absolute"
                top={8}
                right={8}
                onClick={() => removePhoto(index)}
              >
                <IconX size={14} />
              </ActionIcon>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>
    </div>
  );

  // Camera view
  const cameraView = showCamera && (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>{t('delivery.photos.camera')}</Text>
          <Button variant="subtle" size="sm" onClick={stopCamera}>
            <IconX size={16} />
          </Button>
        </Group>
        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'cover',
              borderRadius: 'var(--mantine-radius-md)',
              backgroundColor: 'black',
            }}
          />
          <Button
            pos="absolute"
            bottom={16}
            left="50%"
            style={{ transform: 'translateX(-50%)' }}
            size="lg"
            color="brand"
            onClick={capturePhoto}
            disabled={photos.length >= maxPhotos}
          >
            {t('delivery.photos.capture')}
          </Button>
        </div>
      </Stack>
    </Paper>
  );

  const content = (
    <Stack gap="md">
      {photos.length >= maxPhotos && (
        <Alert icon={<IconAlertCircle size={16} />} color="orange">
          {t('delivery.detail.maxPhotos')}
        </Alert>
      )}

      {/* Action buttons */}
      <Group grow>
        <Button
          leftSection={<IconCamera size={16} />}
          variant="light"
          onClick={startCamera}
          disabled={photos.length >= maxPhotos || showCamera}
        >
          {t('delivery.photos.takePhoto')}
        </Button>
        <Button
          leftSection={<IconUpload size={16} />}
          variant="light"
          onClick={() => fileInputRef.current?.click()}
          disabled={photos.length >= maxPhotos}
        >
          {t('delivery.photos.selectFiles')}
        </Button>
      </Group>

      {/* Camera view */}
      {cameraView}

      {/* File upload area */}
      {!showCamera && photos.length < maxPhotos && uploadArea}

      {/* Photo grid */}
      {photoGrid}

      {/* Upload progress */}
      {isUploading && (
        <div>
          <Text size="sm" c="dimmed" mb="xs">
            {t('delivery.photos.uploading')}
          </Text>
          <Progress value={50} animated />
        </div>
      )}

      {/* Action buttons */}
      <Group justify="flex-end">
        <Button variant="outline" onClick={handleClose} disabled={isUploading}>
          {t('common.cancel')}
        </Button>
        <Button
          leftSection={<IconUpload size={16} />}
          onClick={handleUpload}
          disabled={photos.length === 0 || isUploading}
          loading={isUploading}
        >
          {t('delivery.actions.uploadPhotos')}
        </Button>
      </Group>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={PHOTO_CONFIG.acceptedTypes.join(',')}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(e.target.files);
          }
        }}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Stack>
  );

  // Use Drawer for mobile, Modal for desktop
  if (isMobile) {
    return (
      <Drawer
        opened={opened}
        onClose={handleClose}
        title={t('delivery.actions.uploadPhotos')}
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
          {content}
        </ScrollArea>
      </Drawer>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('delivery.actions.uploadPhotos')}
      centered
      size="lg"
      trapFocus
      returnFocus
    >
      {content}
    </Modal>
  );
}
