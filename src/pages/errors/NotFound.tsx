import { Button, Container, Group, Text, Title, Stack, Paper } from '@mantine/core';
import { useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { ROUTERS } from '@/config/routeConfig';
import { IconIdentifiers } from '@/utils/iconRegistry';
import { getIcon } from '@/utils/iconRegistry';

const IconArrowLeft = getIcon(IconIdentifiers.ARROW_LEFT);
const IconError404 = getIcon(IconIdentifiers.ERROR_404);
const IconHome = getIcon(IconIdentifiers.HOME);

export function NotFound() {
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();
  const navigate = useNavigate();

  return (
    <Container
      size="sm"
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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
          width: '100%',
        }}
      >
        <Stack gap="lg" align="center">
          <IconError404 size={120} color="var(--mantine-color-red-6)" />

          <Title order={1} size="h2">
            {t('errors.notFound')}
          </Title>

          <Text c="dimmed" ta="center" size="lg" maw={400}>
            {t('errors.notFoundDescription')}
          </Text>

          <Group mt="md" justify="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              {t('errors.backToPreviousPage')}
            </Button>

            <Button leftSection={<IconHome size={16} />} onClick={() => navigate(ROUTERS.ROOT)}>
              {t('errors.backToHomePage')}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
