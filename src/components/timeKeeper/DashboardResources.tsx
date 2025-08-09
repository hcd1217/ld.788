import { Card, Group, Box, Text, Title } from '@mantine/core';
import { IconFileText } from '@tabler/icons-react';
import { useTranslation } from '@/hooks/useTranslation';
import classes from './DashboardResources.module.css';

export function DashboardResources() {
  const { t } = useTranslation();

  return (
    <Box>
      <Title order={4} size="h5" mb="sm" c="dimmed">
        {t('timekeeper.resources')}
      </Title>
      <Card className={classes.resourceCard} shadow="xs" radius="md">
        <Group gap="md" wrap="nowrap">
          <IconFileText color="var(--mantine-color-gray-7)" size={46} />
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
