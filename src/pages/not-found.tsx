import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Center,
  Stack,
  Box,
  rem,
} from '@mantine/core';
import { useNavigate } from 'react-router';
import useTranslation from '@/hooks/use-translation.ts';

export default function NotFound() {
  const t = useTranslation();
  const navigate = useNavigate();

  return (
    <Container size="md" style={{ height: '100vh' }}>
      <Center style={{ height: '100%' }}>
        <Stack align="center" gap="xl">
          <Box ta="center">
            <Title
              order={1}
              size={rem(120)}
              fw={900}
              c="brand.6"
              style={{
                lineHeight: 1,
                fontFamily: 'monospace',
              }}
            >
              404
            </Title>
            <Title order={2} size="h3" mt="md" mb="sm">
              {t('Oops! Page not found')}
            </Title>
            <Text size="lg" c="dimmed" maw={500} mx="auto">
              {t(
                `The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.`,
              )}
            </Text>
          </Box>

          <Group mt="xl">
            <Button
              variant="filled"
              size="md"
              onClick={async () => navigate('/')}
            >
              {t('Take me home')}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={async () => navigate(-1)}
            >
              {t('Go back')}
            </Button>
          </Group>

          <Box mt="xl">
            <Text size="sm" c="dimmed" ta="center">
              {t('Error Code: 404 | Page Not Found')}
            </Text>
          </Box>
        </Stack>
      </Center>
    </Container>
  );
}
