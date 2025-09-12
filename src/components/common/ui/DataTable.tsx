import React from 'react';

import { Box, Center, LoadingOverlay, ScrollArea, Table, Text } from '@mantine/core';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

type DataTableColumn<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  accessor?: keyof T;
  width?: string | number;
};

type DataTableProps<T> = {
  readonly data: T[];
  readonly columns: Array<DataTableColumn<T>>;
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly renderActions?: (item: T) => React.ReactNode;
  readonly onRowClick?: (item: T) => void;
  readonly ariaLabel?: string;
  readonly getRowStyles?: (item: T) => React.CSSProperties;
  readonly onActionCellClick?: (event: React.MouseEvent) => void;
};

export function DataTable<T extends Record<string, unknown> & { id: string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage,
  renderActions,
  onRowClick,
  ariaLabel,
  getRowStyles,
  onActionCellClick,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const { isMobile } = useDeviceType();

  const defaultEmptyMessage = emptyMessage || t('common.noDataFound');

  if (isMobile) {
    return null;
  }

  return (
    <Box style={{ position: 'relative' }}>
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{ blur: 2 }}
        transitionProps={{ duration: 300 }}
      />

      <Box visibleFrom="md">
        <ScrollArea>
          <Table striped highlightOnHover aria-label={ariaLabel}>
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th
                    key={column.key}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </Table.Th>
                ))}
                {renderActions ? <Table.Th>{t('common.actions')}</Table.Th> : null}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item) => {
                const rowStyles = getRowStyles?.(item) || {};
                const hasClickHandler = Boolean(onRowClick);
                const combinedStyles = {
                  ...(hasClickHandler ? { cursor: 'pointer' } : {}),
                  ...rowStyles,
                };

                return (
                  <Table.Tr key={item.id} onClick={() => onRowClick?.(item)} style={combinedStyles}>
                    {columns.map((column) => (
                      <Table.Td
                        key={column.key}
                        style={column.width ? { width: column.width } : undefined}
                      >
                        {renderCellContent(item, column)}
                      </Table.Td>
                    ))}
                    {renderActions ? (
                      <Table.Td onClick={onActionCellClick}>{renderActions(item)}</Table.Td>
                    ) : null}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Box>

      {data.length === 0 && !isLoading && (
        <Center py="xl" mih="30vh">
          <Text c="dimmed">{defaultEmptyMessage}</Text>
        </Center>
      )}
    </Box>
  );
}

function renderCellContent<T>(item: T, column: DataTableColumn<T>): string | React.ReactNode {
  if (column.render) {
    return column.render(item);
  }

  if (column.accessor) {
    const value = item[column.accessor];
    return (value || '-') as string;
  }

  return '-';
}
