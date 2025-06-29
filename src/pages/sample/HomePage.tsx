import {Title, Text, Container, Button, Group} from '@mantine/core';
import {useNavigate} from 'react-router';
import {IconLogin} from '@tabler/icons-react';
import {useAppStore} from '@/stores/useAppStore';
import {useTranslation} from '@/hooks/useTranslation';

export function HomePage() {
  const {user, isAuthenticated} = useAppStore();
  const navigate = useNavigate();
  const {t} = useTranslation();

  return (
    <Container size="md" mt="xl">
      <Title order={1}>Welcome to Credo App</Title>
      <Text size="lg" mt="md">
        A Progressive Web App built with Vite, Mantine, Zustand, and React
        Router
      </Text>

      {isAuthenticated && user ? (
        <>
          <Text mt="md">Hello, {user.email}!</Text>
          <Button onClick={() => navigate('/dashboard')}>
            {t('common.dashboard')}
          </Button>
        </>
      ) : (
        <Group mt="xl">
          <Button
            size="lg"
            leftSection={<IconLogin size={20} />}
            onClick={() => navigate('/login')}
          >
            {t('common.login')}
          </Button>
        </Group>
      )}
    </Container>
  );
}
