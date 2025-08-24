import { useRef, useState } from 'react';
import { Paper, Text, Group, Button, Stack, Alert, Badge } from '@mantine/core';
import { IconAlertCircle, IconFileSpreadsheet, IconDownload } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';

export interface BulkImportModalContentProps {
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
  entityType: 'customer' | 'product';
  language: string;
}

export function BulkImportModalContent({
  onFileSelect,
  onDownloadTemplate,
  entityType,
}: BulkImportModalContentProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();

  const validateFileType = (file: File): boolean => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().slice(Math.max(0, file.name.lastIndexOf('.')));
    return allowedTypes.includes(fileExtension);
  };

  const handleFileSelect = (file: File) => {
    if (validateFileType(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      showErrorNotification(t('auth.invalidFileType'), t(`${entityType}.pleaseSelectExcelFile`));
    }
  };

  const handleDownloadTemplate = () => {
    onDownloadTemplate();
    showSuccessNotification(t('common.success'), t(`${entityType}.templateDownloaded`));
  };

  return (
    <Stack gap="md">
      <Alert icon={<IconAlertCircle size={16} />} color="blue">
        {t(`${entityType}.bulkImportDescription`)}
      </Alert>

      {/* Download Template Section */}
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between">
          <div>
            <Group gap="xs">
              <IconFileSpreadsheet size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={500}>{t(`${entityType}.downloadTemplate`)}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {t(`${entityType}.templateDescription`)}
            </Text>
          </div>
          <Button
            variant="light"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadTemplate}
          >
            {t('common.download')}
          </Button>
        </Group>
      </Paper>

      {/* Upload Section */}
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
          const droppedFiles = [...e.dataTransfer.files];
          const excelFile = droppedFiles.find((f) => validateFileType(f));
          if (excelFile) {
            handleFileSelect(excelFile);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
          }}
        />
      </Paper>

      {selectedFile && (
        <Group justify="space-between">
          <Group gap="xs">
            <IconFileSpreadsheet size={20} />
            <Text size="sm">{selectedFile.name}</Text>
            <Badge color="green" variant="light">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </Badge>
          </Group>
        </Group>
      )}

      <Text size="sm" c="dimmed">
        {t(`${entityType}.upsertDescription`)}
      </Text>
    </Stack>
  );
}
