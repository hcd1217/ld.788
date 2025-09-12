import { Group, SimpleGrid, Skeleton, Stack, Table } from '@mantine/core';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

interface DeliveryListSkeletonProps {
  readonly viewMode?: 'table' | 'grid';
  readonly count?: number;
}

export function DeliveryListSkeleton({ viewMode = 'table', count = 5 }: DeliveryListSkeletonProps) {
  const { isMobile } = useDeviceType();
  const { t } = useTranslation();

  // Mobile skeleton (card view)
  if (isMobile) {
    return (
      <Stack gap="sm" px="sm">
        {Array.from({ length: count }).map((_, index) => (
          <Stack
            key={index}
            p="md"
            style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}
          >
            <Group justify="space-between">
              <Skeleton height={24} width="60%" />
              <Skeleton height={20} width={70} radius="xl" />
            </Group>
            <Stack gap="xs">
              <Skeleton height={16} width="50%" />
              <Skeleton height={16} width="40%" />
              <Skeleton height={20} width="35%" />
            </Stack>
          </Stack>
        ))}
      </Stack>
    );
  }

  // Desktop grid skeleton
  if (viewMode === 'grid') {
    return (
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
        {Array.from({ length: count }).map((_, index) => (
          <Stack
            key={index}
            p="lg"
            style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}
          >
            <Group justify="space-between">
              <Skeleton height={24} width="60%" />
              <Skeleton height={20} width={80} radius="xl" />
            </Group>
            <Stack gap="xs">
              <Skeleton height={16} width="70%" />
              <Skeleton height={16} width="50%" />
              <Skeleton height={16} width="40%" />
              <Skeleton height={20} width="45%" />
            </Stack>
            <Group justify="end" mt="md">
              <Skeleton height={28} width={28} radius="sm" />
              <Skeleton height={28} width={28} radius="sm" />
            </Group>
          </Stack>
        ))}
      </SimpleGrid>
    );
  }

  // Desktop table skeleton
  return (
    <Table striped highlightOnHover aria-label={t('po.tableAriaLabel')}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Skeleton height={16} width={80} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={90} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={70} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={80} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={100} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={90} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={60} />
          </Table.Th>
          <Table.Th style={{ width: 120 }}>
            <Skeleton height={16} width={60} />
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Array.from({ length: count }).map((_, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <Skeleton height={20} width="80%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width="70%" />
            </Table.Td>
            <Table.Td>
              <Stack gap={4}>
                <Skeleton height={16} width="70%" />
                <Skeleton height={14} width="50%" />
              </Stack>
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="60%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="50%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="60%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width={70} radius="xl" />
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                <Skeleton height={28} width={28} radius="sm" />
                <Skeleton height={28} width={28} radius="sm" />
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
