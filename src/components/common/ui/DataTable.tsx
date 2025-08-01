import {
  Table,
  LoadingOverlay,
  Box,
  Center,
  Text,
  ScrollArea,
} from '@mantine/core';
import {useTranslation} from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';

type DataTableColumn<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  accessor?: keyof T;
};

type DataTableProps<T> = {
  readonly data: T[];
  readonly columns: Array<DataTableColumn<T>>;
  readonly isLoading?: boolean;
  readonly emptyMessage?: string;
  readonly renderActions?: (item: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown> & {id: string}>({
  data,
  columns,
  isLoading = false,
  emptyMessage,
  renderActions,
}: DataTableProps<T>) {
  const {t} = useTranslation();
  const isDesktop = useIsDesktop();

  const defaultEmptyMessage = emptyMessage || t('common.noDataFound');

  if (!isDesktop) {
    return null;
  }

  return (
    <Box style={{position: 'relative'}}>
      <LoadingOverlay
        visible={isLoading}
        overlayProps={{blur: 2}}
        transitionProps={{duration: 300}}
      />

      <Box visibleFrom="md">
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {columns.map((column) => (
                  <Table.Th key={column.key}>{column.header}</Table.Th>
                ))}
                {renderActions ? (
                  <Table.Th>{t('common.actions')}</Table.Th>
                ) : null}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item) => (
                <Table.Tr key={item.id}>
                  {columns.map((column) => (
                    <Table.Td key={column.key}>
                      {renderCellContent(item, column)}
                    </Table.Td>
                  ))}
                  {renderActions ? (
                    <Table.Td>{renderActions(item)}</Table.Td>
                  ) : null}
                </Table.Tr>
              ))}
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

function renderCellContent<T>(
  item: T,
  column: DataTableColumn<T>,
): string | React.ReactNode {
  if (column.render) {
    return column.render(item);
  }

  if (column.accessor) {
    const value = item[column.accessor];
    return (value || '-') as string;
  }

  return '-';
}
