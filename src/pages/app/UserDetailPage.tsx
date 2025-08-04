import { Navigate, useParams } from 'react-router';
import { Container, Stack, Group, Title, Paper, Text } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/stores/useAppStore';
import { GoBack } from '@/components/common';

export function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const { user } = useAppStore();

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <GoBack />
        </Group>

        <Title order={1} ta="center">
          {t('common.userDetails')}
        </Title>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <Stack gap="md">
            <Text c="dimmed" ta="center">
              User ID: {userId}
            </Text>
            <Text ta="center">{t('common.comingSoon')}</Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
