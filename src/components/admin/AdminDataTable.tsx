import React from 'react';
import {
  Table,
  ScrollArea,
  Center,
  Stack,
  Text,
  type MantineStyleProp,
} from '@mantine/core';
import {VirtualizedAdminDataTable} from './VirtualizedAdminDataTable';

export interface TableColumn<T> {
  readonly key: keyof T | string;
  readonly label: string;
  readonly width?: number | string;
  readonly render?: (item: T) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
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
  readonly renderRow?: (
    item: T,
    index: number,
    children: React.ReactNode,
  ) => React.ReactNode;
  readonly getRowKey?: (item: T, index: number) => string | number;
  readonly tableStyles?: MantineStyleProp;
  readonly virtualScroll?:
    | boolean
    | {
        enabled: boolean;
        height?: number | string;
        rowHeight?: number;
        overscan?: number;
        threshold?: number;
      };
}

export const AdminDataTable = React.memo(function <T>({
  data,
  columns,
  emptyState,
  ariaLabel,
  onRowClick,
  striped = true,
  highlightOnHover = true,
  minHeight = '200px',
  renderRow,
  getRowKey,
  tableStyles,
  virtualScroll,
}: AdminDataTableProps<T>) {
  // Determine if virtual scrolling should be used
  const shouldUseVirtualScroll = (() => {
    if (typeof virtualScroll === 'boolean') {
      return virtualScroll;
    }

    if (virtualScroll && typeof virtualScroll === 'object') {
      if (virtualScroll.enabled) return true;
      if (virtualScroll.threshold && data.length >= virtualScroll.threshold)
        return true;
    }

    // Default: use virtual scrolling for large datasets
    return data.length > 100;
  })();

  // Virtual scrolling doesn't support renderRow, so use regular table if renderRow is provided
  if (shouldUseVirtualScroll && !renderRow) {
    const virtualConfig =
      typeof virtualScroll === 'object' && virtualScroll
        ? virtualScroll
        : undefined;

    return (
      <VirtualizedAdminDataTable
        data={data}
        columns={columns}
        emptyState={emptyState}
        ariaLabel={ariaLabel}
        striped={striped}
        highlightOnHover={highlightOnHover}
        minHeight={minHeight}
        getRowKey={getRowKey}
        tableStyles={tableStyles}
        height={virtualConfig?.height}
        rowHeight={virtualConfig?.rowHeight}
        overscan={virtualConfig?.overscan}
        onRowClick={onRowClick}
      />
    );
  }

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

  return (
    <ScrollArea>
      <Table
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
                style={column.width ? {width: column.width} : undefined}
              >
                {column.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item, index) => {
            const rowKey = getRowKey ? getRowKey(item, index) : index;
            const rowContent = (
              <Table.Tr
                key={rowKey}
                style={onRowClick ? {cursor: 'pointer'} : undefined}
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

            return renderRow ? renderRow(item, index, rowContent) : rowContent;
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}) as <T>(props: AdminDataTableProps<T>) => React.ReactElement;
