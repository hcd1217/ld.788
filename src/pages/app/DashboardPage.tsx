import {Title, Text, Container, Card} from '@mantine/core';

export function DashboardPage() {
  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Home</Title>
        <Text mt="md" size="lg">
          Welcome to the home
        </Text>
      </Card>
    </Container>
  );
}
