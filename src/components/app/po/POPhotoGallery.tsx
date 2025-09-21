import { useState } from 'react';

import { Grid, Image, Modal, ScrollArea, Text } from '@mantine/core';

import { useTranslation } from '@/hooks/useTranslation';

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
  readonly columns?: number;
  readonly imageHeight?: number;
  readonly withScrollArea?: boolean;
  readonly scrollAreaHeight?: string;
};

export function POPhotoGallery({
  photos = [],
  columns = 6,
  imageHeight = 150,
  withScrollArea = false,
  scrollAreaHeight = '50vh',
}: POPhotoGalleryProps) {
  const { t } = useTranslation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        {t('delivery.noPhotos')}
      </Text>
    );
  }

  const photoGrid = (
    <Grid>
      {photos.map((photo, index) => (
        <Grid.Col key={photo.id || index} span={columns}>
          <Image
            src={photo.publicUrl}
            alt={`PO photo ${index + 1}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedPhotoIndex(index)}
            radius="sm"
            h={imageHeight}
            fit="cover"
            fallbackSrc="/photos/no-photo.svg"
          />
        </Grid.Col>
      ))}
    </Grid>
  );

  const content = withScrollArea ? (
    <ScrollArea p={0} m={0} h={scrollAreaHeight} scrollbars="y">
      {photoGrid}
    </ScrollArea>
  ) : (
    photoGrid
  );

  return (
    <>
      {content}

      {/* Photo Modal for enlarged view */}
      <Modal
        opened={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
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
        {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
          <Image
            src={photos[selectedPhotoIndex].publicUrl}
            alt={`PO photo ${selectedPhotoIndex + 1}`}
            fit="contain"
            onClick={() => setSelectedPhotoIndex(null)}
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
