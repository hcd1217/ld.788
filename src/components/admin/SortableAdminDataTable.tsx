import React from 'react';
import {
  Table,
  ScrollArea,
  Center,
  Stack,
  Text,
  Group,
  Box,
  Tooltip,
  type MantineStyleProp,
} from '@mantine/core';
import {IconArrowUp, IconArrowDown, IconArrowsSort} from '@tabler/icons-react';
import {VirtualizedAdminDataTable} from './VirtualizedAdminDataTable';
import {useTranslation} from '@/hooks/useTranslation';

export interface SortableColumn<T> {
  readonly key: keyof T | string;
  readonly label: string;
  readonly width?: number | string;
  readonly render?: (item: T) => React.ReactNode;
  readonly sortable?: boolean;
}

export interface SortableAdminDataTableProps<T> {
  readonly data: T[];
  readonly columns: Array<SortableColumn<T>>;
  readonly emptyState: {
    icon: React.ReactNode;
    message: string;
  };
  readonly ariaLabel: string;
  readonly sortBy?: string;
  readonly sortDirection?: 'asc' | 'desc';
  readonly onSort?: (field: string, direction: 'asc' | 'desc') => void;
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

export const SortableAdminDataTable = React.memo(function <T>({
  data,
  columns,
  emptyState,
  ariaLabel,
  sortBy,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  striped = true,
  highlightOnHover = true,
  minHeight = '200px',
  renderRow,
  getRowKey,
  tableStyles,
  virtualScroll,
}: SortableAdminDataTableProps<T>) {
  const {t} = useTranslation();

  const handleSort = (field: string) => {
    if (!onSort) return;

    if (sortBy === field) {
      // Toggle direction if same field
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      onSort(field, 'asc');
    }
  };

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

  const renderHeader = () => (
    <Table.Thead>
      <Table.Tr>
        {columns.map((column) => {
          const isSortable = column.sortable !== false && onSort;
          const isSorted = sortBy === String(column.key);
          const sortIcon = isSorted ? (
            sortDirection === 'asc' ? (
              <IconArrowUp size={14} />
            ) : (
              <IconArrowDown size={14} />
            )
          ) : (
            <IconArrowsSort size={14} />
          );

          return (
            <Table.Th
              key={String(column.key)}
              style={{
                width: column.width,
                cursor: isSortable ? 'pointer' : undefined,
              }}
              onClick={
                isSortable
                  ? () => {
                      handleSort(String(column.key));
                    }
                  : undefined
              }
            >
              {isSortable ? (
                <Group gap="xs" wrap="nowrap">
                  {column.label}
                  <Tooltip label={t('common.clickToSort')}>
                    <Box c={isSorted ? 'brand' : 'dimmed'}>{sortIcon}</Box>
                  </Tooltip>
                </Group>
              ) : (
                column.label
              )}
            </Table.Th>
          );
        })}
      </Table.Tr>
    </Table.Thead>
  );

  // Check if we should use virtual scrolling
  const shouldVirtualize =
    virtualScroll === true ||
    (typeof virtualScroll === 'object' && virtualScroll.enabled) ||
    (typeof virtualScroll === 'object' &&
      virtualScroll.threshold !== undefined &&
      data.length > virtualScroll.threshold) ||
    (!renderRow && data.length > 100);

  if (shouldVirtualize && !renderRow) {
    const virtualConfig =
      typeof virtualScroll === 'object'
        ? virtualScroll
        : {enabled: true, height: 600};

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
        height={virtualConfig.height}
        rowHeight={virtualConfig.rowHeight}
        overscan={virtualConfig.overscan}
        onRowClick={onRowClick}
      />
    );
  }

  // Regular table rendering
  return (
    <ScrollArea>
      <Table
        striped={striped}
        highlightOnHover={highlightOnHover}
        aria-label={ariaLabel}
        style={tableStyles}
      >
        {renderHeader()}
        <Table.Tbody>
          {data.map((item, index) => {
            const rowKey = getRowKey ? getRowKey(item, index) : index;
            const rowContent = (
              <Table.Tr
                key={rowKey}
                style={{cursor: onRowClick ? 'pointer' : undefined}}
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
}) as <T>(props: SortableAdminDataTableProps<T>) => React.ReactElement;
