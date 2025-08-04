import React, { useRef } from 'react';
import { Table, ScrollArea, Center, Stack, Text, type MantineStyleProp } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { TableColumn } from './AdminDataTable';

interface VirtualizedAdminDataTableProps<T> {
  readonly data: T[];
  readonly columns: Array<TableColumn<T>>;
  readonly emptyState: {
    icon: React.ReactNode;
    message: string;
  };
  readonly ariaLabel: string;
  readonly onRowClick?: (item: T) => void;
  readonly striped?: boolean;
  readonly highlightOnHover?: boolean;
  readonly minHeight?: number | string;
  readonly rowHeight?: number;
  readonly overscan?: number;
  readonly getRowKey?: (item: T, index: number) => string | number;
  readonly tableStyles?: MantineStyleProp;
  readonly height?: number | string;
}

export const VirtualizedAdminDataTable = React.memo(function <T>({
  data,
  columns,
  emptyState,
  ariaLabel,
  onRowClick,
  striped = true,
  highlightOnHover = true,
  minHeight = '200px',
  rowHeight = 50,
  overscan = 5,
  getRowKey,
  tableStyles,
  height = 600,
}: VirtualizedAdminDataTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  if (data.length === 0) {
    return (
      <Center py="xl" mih={minHeight}>
        <Stack align="center" gap="xs">
          {emptyState.icon}
          <Text c="dimmed">{emptyState.message}</Text>
        </Stack>
      </Center>
    );
  }

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0 ? totalSize - (virtualItems?.at(-1)?.end ?? 0) : 0;

  return (
    <ScrollArea
      ref={parentRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Table
        ref={tableRef}
        striped={striped}
        highlightOnHover={highlightOnHover}
        aria-label={ariaLabel}
        style={tableStyles}
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((column) => (
              <Table.Th
                key={String(column.key)}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paddingTop > 0 && <tr style={{ height: paddingTop }} />}
          {virtualItems.map((virtualRow) => {
            const item = data[virtualRow.index];
            const rowKey = getRowKey ? getRowKey(item, virtualRow.index) : virtualRow.index;

            return (
              <Table.Tr
                key={rowKey}
                ref={virtualizer.measureElement}
                data-index={virtualRow.index}
                style={{
                  cursor: onRowClick ? 'pointer' : undefined,
                  height: `${virtualRow.size}px`,
                }}
                onClick={
                  onRowClick
                    ? () => {
                        onRowClick(item);
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <Table.Td key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(item[column.key as keyof T] ?? '')}
                  </Table.Td>
                ))}
              </Table.Tr>
            );
          })}
          {paddingBottom > 0 && <tr style={{ height: paddingBottom }} />}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}) as <T>(props: VirtualizedAdminDataTableProps<T>) => React.ReactElement;
