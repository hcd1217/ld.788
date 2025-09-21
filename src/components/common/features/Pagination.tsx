import { Group, Pagination as MantinePagination, Select, Stack } from '@mantine/core';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useAppStore } from '@/stores/useAppStore';

type PaginationProps = {
  readonly hidden?: boolean;
  readonly totalPages: number;
  readonly pageSize: number;
  readonly currentPage: number;
  readonly onPageSizeChange: (pageSize: number) => void;
  readonly onPageChange: (page: number) => void;
};

export function Pagination({
  hidden,
  totalPages,
  pageSize,
  currentPage,
  onPageSizeChange,
  onPageChange,
}: PaginationProps) {
  const { config } = useAppStore();
  const { isDesktop } = useDeviceType();

  const pagingOptions = isDesktop
    ? config.pagination.desktop.pagingOptions
    : config.pagination.mobile.pagingOptions;

  if (hidden) {
    return null;
  }

  return (
    <Stack gap="md" mt="md">
      <Group justify="space-between">
        {pagingOptions.length > 1 ? (
          <Select
            value={pageSize.toString()}
            data={pagingOptions}
            disabled={pagingOptions.length < 2}
            style={{ width: 100 }}
            onChange={(value) => {
              const size = Number(value);
              if (Number.isNaN(size) || !size) {
                return;
              }

              onPageSizeChange(size);
            }}
          />
        ) : (
          <div />
        )}
        <MantinePagination
          mr="sm"
          total={totalPages}
          value={currentPage}
          size="sm"
          onChange={onPageChange}
        />
      </Group>
    </Stack>
  );
}
