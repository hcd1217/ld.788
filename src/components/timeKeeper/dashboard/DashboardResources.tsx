import { Box, Card, Group, Text, Title } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';

import { useTranslation } from '@/hooks/useTranslation';

export function DashboardResources() {
  const { t } = useTranslation();

  return (
    <Box my="1rem">
      <Title order={4} size="h5" mb="sm" c="dimmed">
        {t('timekeeper.resourcesTitle')}
      </Title>
      <Card
        style={{
          background: 'white',
          border: '1px solid var(--mantine-color-gray-2)',
          cursor: 'pointer',
        }}
        shadow="xs"
        radius="md"
      >
        <Group gap="md" wrap="nowrap">
          <IconClipboardText color="var(--mantine-color-gray-7)" size={46} stroke={1.5} />
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={600}>
              {t('timekeeper.documents.title')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('timekeeper.documents.description')}
            </Text>
          </Box>
        </Group>
      </Card>
    </Box>
  );
}
