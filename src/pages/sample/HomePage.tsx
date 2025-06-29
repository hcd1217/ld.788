import {Title, Text, Container} from '@mantine/core';
import {useAppStore} from '@/stores/useAppStore';

export function HomePage() {
  const {user} = useAppStore();
  return (
    <Container size="md" mt="xl">
      <Title order={1}>Welcome to Credo App</Title>
      <Text size="lg" mt="md">
        A Progressive Web App built with Vite, Mantine, Zustand, and React
        Router
      </Text>
      {user ? <Text mt="md">Hello, {user.email}!</Text> : null}
    </Container>
  );
}
