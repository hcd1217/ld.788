import { Outlet } from 'react-router';
import { useNavigate } from 'react-router';

import { Button, Center, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { IconDeviceDesktop } from '@tabler/icons-react';

import { ROUTERS } from '@/config/routeConfig';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';
import { useTranslation } from '@/hooks/useTranslation';

export function PCOnlyLayout() {
  const { isMobile } = useDeviceType();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();

  if (isMobile) {
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
              <IconDeviceDesktop size={64} color="var(--mantine-color-blue-6)" />

              <Title order={2}>{t('pcOnly.title')}</Title>

              <Text c="dimmed" ta="center" maw={400}>
                {t('pcOnly.description')}
              </Text>
            </Stack>
            <Button mt="md" onClick={() => navigate(ROUTERS.ROOT)}>
              {t('common.goToHome')}
            </Button>
          </Paper>
        </Center>
      </Container>
    );
  }

  return <Outlet />;
}
