import { Button, type ButtonProps } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { exportToCSV, type ExportColumn } from '@/utils/export';
import { showErrorNotification, showSuccessNotification } from '@/utils/notifications';
import { logError } from '@/utils/logger';

interface ExportButtonProps<T> extends Omit<ButtonProps, 'onClick'> {
  readonly data: readonly T[];
  readonly columns: ReadonlyArray<ExportColumn<T>>;
  readonly filename: string;
  readonly onExport?: () => void;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  onExport,
  children,
  ...buttonProps
}: ExportButtonProps<T>) {
  const { t } = useTranslation();

  const handleExport = () => {
    try {
      exportToCSV(data, columns, filename);
      showSuccessNotification(
        t('common.success'),
        t('common.exportSuccess', { count: data.length }),
      );
      onExport?.();
    } catch (error) {
      logError('Export failed:', error, {
        module: 'ExportButton',
        action: 'ExportButton',
      });
      showErrorNotification(t('common.error'), t('common.exportFailed'));
    }
  };

  return (
    <Button
      leftSection={<IconDownload size={14} />}
      variant="light"
      disabled={data.length === 0}
      onClick={handleExport}
      {...buttonProps}
    >
      {children || t('common.export')}
    </Button>
  );
}
