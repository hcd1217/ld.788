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
import {IconArrowLeft, IconDeviceDesktop} from '@tabler/icons-react';
import {Outlet, useNavigate} from 'react-router';
import {useTranslation} from '@/hooks/useTranslation';
import useIsDesktop from '@/hooks/useIsDesktop';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';

export function PCOnlyLayout() {
  const navigate = useNavigate();
  const {t} = useTranslation();
  const isDarkMode = useIsDarkMode();
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <Container size="sm" mt="xl">
        <Stack gap="xl">
          <Group>
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
              <IconDeviceDesktop
                size={64}
                color="var(--mantine-color-blue-6)"
              />

              <Title order={2}>{t('pcOnly.title')}</Title>

              <Text c="dimmed" ta="center" maw={400}>
                {t('pcOnly.description')}
              </Text>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    );
  }

  return <Outlet />;
}
