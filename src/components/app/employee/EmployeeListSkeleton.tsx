import { Group, SimpleGrid, Skeleton, Stack, Table } from '@mantine/core';

import { useDeviceType } from '@/hooks/useDeviceType';
import { useTranslation } from '@/hooks/useTranslation';

interface EmployeeListSkeletonProps {
  readonly viewMode?: 'table' | 'grid';
  readonly count?: number;
}

export function EmployeeListSkeleton({ viewMode = 'table', count = 5 }: EmployeeListSkeletonProps) {
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
              <Skeleton height={20} width={60} radius="xl" />
            </Group>
            <Stack gap="xs">
              <Skeleton height={16} width="40%" />
              <Skeleton height={16} width="50%" />
              <Skeleton height={16} width="30%" />
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
              <Skeleton height={24} width="70%" />
              <Skeleton height={24} width={24} circle />
            </Group>
            <Stack gap="xs">
              <Skeleton height={16} width="50%" />
              <Skeleton height={16} width="60%" />
              <Skeleton height={16} width="40%" />
              <Skeleton height={16} width="30%" />
            </Stack>
            <Group justify="space-between" mt="md">
              <Skeleton height={20} width={80} radius="xl" />
              <Skeleton height={20} width={60} radius="xl" />
            </Group>
          </Stack>
        ))}
      </SimpleGrid>
    );
  }

  // Desktop table skeleton
  return (
    <Table striped highlightOnHover aria-label={t('employee.tableAriaLabel')}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Skeleton height={16} width={60} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={40} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={50} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={50} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={70} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={70} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={60} />
          </Table.Th>
          <Table.Th>
            <Skeleton height={16} width={50} />
          </Table.Th>
          <Table.Th style={{ width: 100 }}>
            <Skeleton height={16} width={60} />
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Array.from({ length: count }).map((_, index) => (
          <Table.Tr key={index}>
            <Table.Td>
              <Group gap="sm">
                <Skeleton height={20} width="80%" />
              </Group>
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="60%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="70%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="60%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width={80} radius="xl" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="50%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={16} width="40%" />
            </Table.Td>
            <Table.Td>
              <Skeleton height={20} width={60} radius="xl" />
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
