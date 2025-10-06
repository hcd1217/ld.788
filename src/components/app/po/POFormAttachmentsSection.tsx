import React, { useRef } from 'react';

import { ActionIcon, Box, Button, Card, Group, Stack, Text } from '@mantine/core';
import { IconFile, IconPaperclip, IconTrash, IconUpload } from '@tabler/icons-react';

import type { POFormValues } from '@/hooks/usePOForm';
import { useTranslation } from '@/hooks/useTranslation';

import type { UseFormReturnType } from '@mantine/form';

type POFormAttachmentsSectionProps = {
  readonly form: UseFormReturnType<POFormValues>;
  readonly isLoading?: boolean;
};

const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function POFormAttachmentsSection({
  form,
  isLoading = false,
}: POFormAttachmentsSectionProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of selectedFiles) {
      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (${t('po.invalidFileType')})`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (${t('po.fileTooLarge')})`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      const currentFiles = form.values.attachments ?? [];
      form.setFieldValue('attachments', [...currentFiles, ...validFiles]);
    }

    // Reset input to allow selecting the same file again
    if (event.target) {
      event.target.value = '';
    }

    // TODO: Show notification for invalid files if any
    if (invalidFiles.length > 0) {
      console.warn('Invalid files:', invalidFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const currentFiles = form.values.attachments ?? [];
    form.setFieldValue(
      'attachments',
      currentFiles.filter((_, i) => i !== index),
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const attachments = form.values.attachments ?? [];

  return (
    <Card withBorder padding="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconPaperclip size={20} />
            <Text fw={500}>{t('po.attachments')}</Text>
          </Group>
          <Text size="sm" c="dimmed">
            {t('po.attachmentsOptional')}
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          {t('po.attachmentsDescription')}
        </Text>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Upload Button */}
        <Button
          variant="light"
          leftSection={<IconUpload size={16} />}
          onClick={handleFileInputClick}
          disabled={isLoading}
        >
          {t('po.selectFiles')}
        </Button>

        {/* Selected Files List */}
        {attachments.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('po.selectedFiles')} ({attachments.length})
            </Text>
            {attachments.map((file, index) => (
              <Card key={`${file.name}-${index}`} withBorder padding="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                    <IconFile size={20} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" truncate>
                        {file.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {formatFileSize(file.size)}
                      </Text>
                    </Box>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveFile(index)}
                    disabled={isLoading}
                    aria-label={t('common.remove')}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
