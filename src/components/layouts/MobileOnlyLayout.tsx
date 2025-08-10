import {
  Anchor,
  Box,
  Center,
  Container,
  Group,
  rem,
  Stack,
  Paper,
  Title,
  Text,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceMobile } from '@tabler/icons-react';
import { Outlet, useNavigate } from 'react-router';
import { useTranslation } from '@/hooks/useTranslation';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useIsDarkMode } from '@/hooks/useIsDarkMode';

export function MobileOnlyLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();
  const { isMobile } = useDeviceType();

  if (!isMobile) {
    return (
      <Container size="sm" mt="xl">
        <Stack gap="xl">
          <Group>
            <Anchor component="button" type="button" size="sm" onClick={() => navigate(-1)}>
              <Center inline>
                <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                <Box ml={5}>{t('common.backToPreviousPage')}</Box>
              </Center>
            </Anchor>
          </Group>

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
              <IconDeviceMobile size={64} color="var(--mantine-color-brand-6)" />

              <Title order={2}>{t('mobileOnly.title')}</Title>

              <Text c="dimmed" ta="center" maw={400}>
                {t('mobileOnly.description')}
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return <Outlet />;
}
