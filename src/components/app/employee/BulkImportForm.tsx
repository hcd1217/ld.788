import React, { useRef, useState } from 'react';

import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Paper,
  Progress,
  Stack,
  Text,
  Transition,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconCheck,
  IconDownload,
  IconFileSpreadsheet,
  IconUpload,
  IconUsers,
  IconX,
} from '@tabler/icons-react';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

type ImportResult = {
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  errors?: string[];
};

type BulkImportFormProps = {
  readonly isLoading: boolean;
  readonly isDownloading: boolean;
  readonly file?: File;
  readonly importResult?: ImportResult;
  readonly onDownloadSample: () => void;
  readonly onFileSelect: (file: File) => void;
  readonly onFileRemove: () => void;
  readonly onImport: () => void;
  readonly onCancel: () => void;
  readonly validateFileType: (file: File) => boolean;
};

export function BulkImportForm({
  isLoading,
  isDownloading,
  file,
  importResult,
  onDownloadSample,
  onFileSelect,
  onFileRemove,
  onImport,
  onCancel,
  validateFileType,
}: BulkImportFormProps) {
  const { t } = useTranslation();
  const { isDesktop } = useDeviceType();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted] = useDisclosure(true);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const droppedFiles = [...event.dataTransfer.files];
    const excelFile = droppedFiles.find((file) => validateFileType(file));
    if (excelFile) {
      onFileSelect(excelFile);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && validateFileType(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <Stack gap="md">
      {/* Download Sample Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Group>
            <IconFileSpreadsheet size={24} color="var(--mantine-color-blue-6)" />
            <div>
              <Text fw={500} size="lg">
                {t('employee.sampleExcelTemplate')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('employee.sampleExcelDescription')}
              </Text>
            </div>
          </Group>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconDownload size={16} />}
            loading={isDownloading}
            fullWidth={!isDesktop}
            onClick={onDownloadSample}
          >
            {t('employee.downloadSampleExcel')}
          </Button>
        </Stack>
      </Paper>

      {/* Upload Section */}
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="md">
          <Group>
            <IconUpload size={24} color="var(--mantine-color-green-6)" />
            <div>
              <Text fw={500} size="lg">
                {t('employee.uploadEmployeeFile')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('employee.supportedFormats')}
              </Text>
            </div>
          </Group>

          <Transition mounted={mounted} transition="fade">
            {(styles) => (
              <div style={styles}>
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
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleFileInputClick}
                >
                  <Stack align="center" gap="md">
                    <IconFileSpreadsheet size={48} color="var(--mantine-color-gray-5)" />
                    <div style={{ textAlign: 'center' }}>
                      <Text size="lg" fw={500}>
                        {t('common.dragAndDropFile')}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {t('common.orClickToSelect')}
                      </Text>
                    </div>
                  </Stack>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                  />
                </Paper>
              </div>
            )}
          </Transition>

          {file ? (
            <Group justify="space-between">
              <Group gap="xs">
                <IconFileSpreadsheet size={20} />
                <Text size="sm">{file.name}</Text>
                <Badge color="green" variant="light">
                  {(file.size / 1024).toFixed(2)} KB
                </Badge>
              </Group>
              <Button variant="subtle" color="red" size="xs" onClick={onFileRemove}>
                {t('common.remove')}
              </Button>
            </Group>
          ) : null}

          {importResult ? (
            <>
              <Divider />
              <Stack gap="sm">
                <Text fw={500} size="lg">
                  {t('common.importResults')}
                </Text>
                <Progress
                  value={(importResult.summary.success / importResult.summary.total) * 100}
                  color={importResult.summary.failed > 0 ? 'yellow' : 'green'}
                  size="xl"
                  radius="md"
                />
                <Group justify="space-between">
                  <Badge color="blue" variant="light" leftSection={<IconUsers size={14} />}>
                    {t('common.total')}: {importResult.summary.total}
                  </Badge>
                  <Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
                    {t('common.success')}: {importResult.summary.success}
                  </Badge>
                  <Badge color="red" variant="light" leftSection={<IconX size={14} />}>
                    {t('common.failed')}: {importResult.summary.failed}
                  </Badge>
                </Group>
                {importResult.errors && importResult.errors.length > 0 ? (
                  <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                    {importResult.errors.join(', ')}
                  </Alert>
                ) : null}
              </Stack>
            </>
          ) : null}

          <Group justify="flex-end">
            <Button variant="light" disabled={isLoading} onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={isLoading}
              disabled={!file}
              leftSection={<IconUpload size={16} />}
              onClick={onImport}
            >
              {t('employee.importEmployees')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
