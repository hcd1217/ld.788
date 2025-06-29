import {Title, Text, Container, Card} from '@mantine/core';

export function DashboardPage() {
  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Dashboard</Title>
        <Text mt="md" size="lg">
          Welcome to the dashboard
        </Text>
      </Card>
    </Container>
  );
}
