import {Title, Text, Container, Card} from '@mantine/core';

export function NotificationsPage() {
  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Notifications</Title>
        <Text mt="md" size="lg">
          Welcome to the notifications page
        </Text>
      </Card>
    </Container>
  );
}
