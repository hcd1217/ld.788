import React from 'react';
import {
  Stack,
  TextInput,
  ActionIcon,
  Center,
  Text,
  Group,
  type MantineStyleProp,
} from '@mantine/core';
import {IconSearch, IconX} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useTableFilters} from '@/hooks/useTableFilters';
import {
  type SortableColumn,
  SortableAdminDataTable,
} from '@/components/admin/SortableAdminDataTable';

export interface FilterableColumn<T> extends SortableColumn<T> {
  searchable?: boolean;
}

export interface FilterableAdminDataTableProps<T> {
  readonly data: T[];
  readonly columns: Array<FilterableColumn<T>>;
  readonly emptyState: {
    icon: React.ReactNode;
    message: string;
  };
  readonly ariaLabel: string;
  readonly searchPlaceholder?: string;
  readonly searchFields?: Array<keyof T>;
  readonly defaultSortBy?: keyof T;
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
        threshold?: number;
        height?: number | string;
        rowHeight?: number;
        overscan?: number;
      };
  readonly extraActions?: React.ReactNode;
}

export const FilterableAdminDataTable = React.memo(function <
  T extends Record<string, unknown>,
>({
  data,
  columns,
  emptyState,
  ariaLabel,
  searchPlaceholder,
  searchFields,
  defaultSortBy,
  onRowClick,
  striped = true,
  highlightOnHover = true,
  minHeight = '200px',
  renderRow,
  getRowKey,
  tableStyles,
  virtualScroll,
  extraActions,
}: FilterableAdminDataTableProps<T>) {
  const {t} = useTranslation();

  // Determine which fields are searchable
  const effectiveSearchFields =
    searchFields ||
    columns.filter((col) => col.searchable !== false).map((col) => col.key);

  const [filteredData, filters, handlers] = useTableFilters(
    data,
    effectiveSearchFields,
    defaultSortBy,
  );

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    handlers.setSortBy(field);
    handlers.setSortDirection(direction);
  };

  return (
    <Stack gap="md">
      {/* Search Input and Extra Actions */}
      <Group justify="space-between" align="flex-end">
        <TextInput
          placeholder={searchPlaceholder || t('common.search')}
          leftSection={<IconSearch size={16} />}
          value={filters.searchQuery}
          rightSection={
            filters.searchQuery ? (
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={() => handlers.setSearchQuery('')}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          style={{flex: 1}}
          onChange={(event) =>
            handlers.setSearchQuery(event.currentTarget.value)
          }
        />
        {extraActions ? <Group gap="sm">{extraActions}</Group> : null}
      </Group>

      {/* Table with custom header for sorting */}
      {filteredData.length === 0 ? (
        <Center py="xl" mih={minHeight}>
          <Stack align="center" gap="xs">
            {emptyState.icon}
            <Text c="dimmed">
              {filters.searchQuery
                ? t('common.noResultsFound')
                : emptyState.message}
            </Text>
          </Stack>
        </Center>
      ) : (
        <SortableAdminDataTable
          data={filteredData}
          columns={columns}
          emptyState={emptyState}
          ariaLabel={ariaLabel}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          striped={striped}
          highlightOnHover={highlightOnHover}
          minHeight={minHeight}
          renderRow={renderRow}
          getRowKey={getRowKey}
          tableStyles={tableStyles}
          virtualScroll={virtualScroll}
          onSort={handleSort}
          onRowClick={onRowClick}
        />
      )}
    </Stack>
  );
}) as <T extends Record<string, unknown>>(
  props: FilterableAdminDataTableProps<T>,
) => React.ReactElement;
