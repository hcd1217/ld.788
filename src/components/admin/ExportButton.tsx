import {Button, type ButtonProps} from '@mantine/core';
import {IconDownload} from '@tabler/icons-react';
import {notifications} from '@mantine/notifications';
import {useTranslation} from '@/hooks/useTranslation';
import {exportToCSV, type ExportColumn} from '@/utils/export';

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
  const {t} = useTranslation();

  const handleExport = () => {
    try {
      exportToCSV(data, columns, filename);
      notifications.show({
        title: t('common.success'),
        message: t('common.exportSuccess', {count: data.length}),
        color: 'green',
      });
      onExport?.();
    } catch (error) {
      console.error('Export failed:', error);
      notifications.show({
        title: t('common.error'),
        message: t('common.exportFailed'),
        color: 'red',
      });
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
