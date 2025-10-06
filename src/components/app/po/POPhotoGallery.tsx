import React from 'react';
import { useState } from 'react';

import {
  ActionIcon,
  Box,
  Divider,
  Grid,
  Image,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';
import { confirmAction } from '@/utils/modals';

type PhotoData = {
  id?: string;
  publicUrl: string;
  key: string;
  caption?: string;
  timestamp?: string;
  uploadedBy?: string;
};

type POPhotoGalleryProps = {
  readonly photos?: PhotoData[];
  readonly deliveryPhotos?: PhotoData[];
  readonly columns?: number;
  readonly imageHeight?: number;
  readonly withScrollArea?: boolean;
  readonly scrollAreaHeight?: string;
  readonly canDelete?: boolean;
  readonly onDeletePhoto?: (photoId: string) => Promise<void>;
};

export function POPhotoGallery({
  photos = [],
  deliveryPhotos = [],
  columns = 6,
  imageHeight = 150,
  withScrollArea = false,
  scrollAreaHeight = '50vh',
  canDelete = false,
  onDeletePhoto,
}: POPhotoGalleryProps) {
  const { t } = useTranslation();
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string;
    type: 'po' | 'delivery';
  } | null>(null);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);

  const handleDeletePhoto = (photoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    confirmAction({
      title: t('common.delete'),
      message: t('common.deleteConfirmationMessage'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmColor: 'red',
      onConfirm: async () => {
        if (onDeletePhoto) {
          await onDeletePhoto(photoId);
        }
      },
    });
  };

  const hasPhotos = photos.length > 0;
  const hasDeliveryPhotos = deliveryPhotos.length > 0;

  if (!hasPhotos && !hasDeliveryPhotos) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        {t('delivery.noPhotos')}
      </Text>
    );
  }

  const renderPhotoGrid = (photoList: PhotoData[], photoType: 'po' | 'delivery') => (
    <Grid>
      {photoList.map((photo, index) => (
        <Grid.Col key={photo.id || index} span={columns}>
          <Box
            pos="relative"
            onMouseEnter={() => setHoveredPhotoId(photo.id || String(index))}
            onMouseLeave={() => setHoveredPhotoId(null)}
          >
            <Image
              src={photo.publicUrl}
              alt={`${photoType === 'po' ? 'PO' : 'Delivery'} photo ${index + 1}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedPhoto({ url: photo.publicUrl, type: photoType })}
              radius="sm"
              h={imageHeight}
              fit="cover"
              fallbackSrc="/photos/no-photo.svg"
            />
            {canDelete && photo.id && hoveredPhotoId === photo.id && (
              <ActionIcon
                pos="absolute"
                top={8}
                right={8}
                color="red"
                variant="filled"
                size="sm"
                onClick={(e) => handleDeletePhoto(photo.id!, e)}
                style={{ zIndex: 1 }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Box>
        </Grid.Col>
      ))}
    </Grid>
  );

  const content = (
    <Stack gap="md">
      {hasDeliveryPhotos && (
        <>
          <Text size="sm" fw={600} c="dimmed">
            {t('delivery.photos')}
          </Text>
          {renderPhotoGrid(deliveryPhotos, 'delivery')}
        </>
      )}

      {hasPhotos && hasDeliveryPhotos && <Divider my="sm" />}

      {hasPhotos && (
        <>
          <Text size="sm" fw={600} c="dimmed">
            {t('po.photos')}
          </Text>
          {renderPhotoGrid(photos, 'po')}
        </>
      )}
    </Stack>
  );

  const wrappedContent = withScrollArea ? (
    <ScrollArea p={0} m={0} h={scrollAreaHeight} scrollbars="y">
      {content}
    </ScrollArea>
  ) : (
    content
  );

  return (
    <>
      {wrappedContent}

      {/* Photo Modal for enlarged view */}
      <Modal
        opened={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        size="xl"
        centered
        withCloseButton={false}
        padding={0}
        styles={{
          body: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(77, 77, 77, 0.95)',
            padding: '2px',
          },
          content: {
            backgroundColor: 'transparent',
            maxHeight: '95vh',
            maxWidth: '95vw',
          },
        }}
      >
        {selectedPhoto && (
          <Image
            src={selectedPhoto.url}
            alt={`${selectedPhoto.type === 'po' ? 'PO' : 'Delivery'} photo`}
            fit="contain"
            onClick={() => setSelectedPhoto(null)}
            style={{
              cursor: 'pointer',
              maxHeight: '90vh',
              maxWidth: '90vw',
              width: 'auto',
              height: 'auto',
            }}
            fallbackSrc="/photos/no-photo.svg"
          />
        )}
      </Modal>
    </>
  );
}
