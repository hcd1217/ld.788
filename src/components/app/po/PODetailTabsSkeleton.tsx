import { Box, Stack, ScrollArea, Skeleton } from '@mantine/core';
import { Tabs } from '@/components/common';
import {
  IconInfoCircle,
  IconClipboardList,
  IconTruck,
  IconFileInvoice,
  IconMessage,
} from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import { POBasicInfoCardSkeleton } from './POBasicInfoCardSkeleton';

export function PODetailTabsSkeleton() {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="info">
      <ScrollArea offsetScrollbars scrollbarSize={4}>
        <Tabs.List>
          <Tabs.Tab value="info" leftSection={<IconInfoCircle size={16} />}>
            {t('po.orderInformation')}
          </Tabs.Tab>
          <Tabs.Tab value="items" leftSection={<IconClipboardList size={16} />}>
            {t('po.orderItems')}
          </Tabs.Tab>
          <Tabs.Tab value="timeline" leftSection={<IconTruck size={16} />}>
            {t('po.orderTimeline')}
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFileInvoice size={16} />}>
            {t('po.documents')}
          </Tabs.Tab>
          <Tabs.Tab value="communication" leftSection={<IconMessage size={16} />}>
            {t('po.communicationLog')}
          </Tabs.Tab>
        </Tabs.List>
      </ScrollArea>

      <Tabs.Panel value="info" pt="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: '800px', width: '100%' }}>
            <Stack gap="xl">
              {/* POActionZone skeleton */}
              <Stack gap="sm">
                <Skeleton height={20} width={150} mb="sm" />
                <Skeleton height={36} width="100%" radius="sm" />
              </Stack>
              <POBasicInfoCardSkeleton />
            </Stack>
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="items" pt="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: '800px', width: '100%' }}>
            {/* POItemsList skeleton */}
            <Stack gap="md">
              <Skeleton height={24} width={200} />
              {Array.from({ length: 3 }).map((_, index) => (
                <Stack
                  key={index}
                  p="md"
                  style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}
                >
                  <Skeleton height={20} width="60%" />
                  <Skeleton height={16} width="40%" />
                  <Skeleton height={16} width="30%" />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="timeline" pt="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: '800px', width: '100%' }}>
            {/* POTimeline skeleton */}
            <Stack gap="lg">
              {Array.from({ length: 4 }).map((_, index) => (
                <Stack key={index} gap="xs">
                  <Skeleton height={20} width={150} radius="xl" />
                  <Skeleton height={16} width={200} />
                  <Skeleton height={14} width={120} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="documents" pt="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box style={{ maxWidth: '800px', width: '100%' }}>
            <Skeleton height={200} radius="md" />
          </Box>
        </Box>
      </Tabs.Panel>

      <Tabs.Panel value="communication" pt="xl">
        <Skeleton height={200} radius="md" />
      </Tabs.Panel>
    </Tabs>
  );
}
