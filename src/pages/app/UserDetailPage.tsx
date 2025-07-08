import {Navigate, useNavigate, useParams} from 'react-router';
import {
  Container,
  Stack,
  Group,
  Anchor,
  Center,
  Box,
  rem,
  Title,
  Paper,
  Text,
} from '@mantine/core';
import {IconArrowLeft} from '@tabler/icons-react';
import {useTranslation} from '@/hooks/useTranslation';
import {useAppStore} from '@/stores/useAppStore';

export function UserDetailPage() {
  const navigate = useNavigate();
  const {userId} = useParams<{userId: string}>();
  const {t} = useTranslation();
  const {user} = useAppStore();

  if (!user?.isRoot) {
    return <Navigate to="/home" />;
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="xl">
        <Group justify="space-between">
          <Anchor
            component="button"
            type="button"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <Center inline>
              <IconArrowLeft
                style={{width: rem(12), height: rem(12)}}
                stroke={1.5}
              />
              <Box ml={5}>{t('common.backToPreviousPage')}</Box>
            </Center>
          </Anchor>
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
