import { useNavigate } from 'react-router';

import { Button, Center, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

import { ROUTERS } from '@/config/routeConfig';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { useTranslation } from '@/hooks/useTranslation';

type NoPermissionProps = {
  readonly withGoBack?: boolean;
  readonly message?: string;
};

export function NoPermission({ withGoBack = false, message }: NoPermissionProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();

  const handleGoBack = () => {
    if (withGoBack && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(ROUTERS.ROOT);
    }
  };

  return (
    <Container size="sm" mt="xl" h="90vh">
      <Center h="100%">
        <Paper
          withBorder
          shadow="sm"
          p="xl"
          radius="md"
          style={{
            textAlign: 'center',
            backgroundColor: isDarkMode
              ? 'var(--mantine-color-dark-6)'
              : 'var(--mantine-color-gray-0)',
          }}
        >
          <Stack gap="lg" align="center">
            <IconLock size={64} color="var(--mantine-color-red-6)" />

            <Title order={2}>{t('noPermission.title')}</Title>

            <Text c="dimmed" ta="center" maw={400}>
              {message || t('noPermission.description')}
            </Text>

            <Group justify="center" mt="md">
              <Button onClick={handleGoBack}>
                {withGoBack ? t('noPermission.goBack') : t('common.goToHome')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Center>
    </Container>
  );
}
