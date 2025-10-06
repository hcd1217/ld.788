import { useState } from 'react';

import { ActionIcon, Box, Card, Group, Image, Modal, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconDownload, IconFile, IconPaperclip } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';

type AttachmentData = {
  readonly publicUrl: string;
  readonly key: string;
  readonly caption?: string;
};

type POAttachmentsSectionProps = {
  readonly attachments?: AttachmentData[];
};

export function POAttachmentsSection({ attachments = [] }: POAttachmentsSectionProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.append(link);
    link.click();
    link.remove();
  };

  const getFileName = (key: string) => {
    const parts = key.split('/');
    return parts.at(-1) || key;
  };

  const isImage = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some((ext) => lowerUrl.includes(ext));
  };

  return (
    <>
      <Stack gap="xs">
        <Group gap="xs">
          <IconPaperclip size={16} />
          <Text size="sm" fw={500} c="dimmed">
            {t('po.attachments')} ({attachments.length})
          </Text>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {attachments.map((attachment, index) => {
            const fileName = getFileName(attachment.key);
            const isImageFile = isImage(attachment.publicUrl);

            if (isImageFile) {
              return (
                <Card key={attachment.key || index} withBorder p="xs">
                  <Stack gap="xs">
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" truncate title={fileName} style={{ flex: 1 }}>
                        {fileName}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleDownload(attachment.publicUrl, fileName)}
                        aria-label={t('common.download')}
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                    </Group>
                    <Image
                      src={attachment.publicUrl}
                      alt={fileName}
                      radius="sm"
                      h={120}
                      fit="cover"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedImage(attachment.publicUrl)}
                      fallbackSrc="/photos/no-photo.svg"
                    />
                    {attachment.caption && (
                      <Text size="xs" c="dimmed" truncate>
                        {attachment.caption}
                      </Text>
                    )}
                  </Stack>
                </Card>
              );
            }

            return (
              <Card key={attachment.key || index} withBorder p="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <IconFile size={20} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" truncate title={fileName}>
                        {fileName}
                      </Text>
                      {attachment.caption && (
                        <Text size="xs" c="dimmed" truncate>
                          {attachment.caption}
                        </Text>
                      )}
                    </Box>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleDownload(attachment.publicUrl, fileName)}
                    aria-label={t('common.download')}
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>

      {/* Image Modal for enlarged view */}
      <Modal
        opened={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
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
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Attachment"
            fit="contain"
            onClick={() => setSelectedImage(null)}
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
