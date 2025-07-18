import {Title, Text, Container, Card, Stack} from '@mantine/core';

export function DashboardPage() {
  return (
    <Container fluid px="xl" mt="xl">
      <Stack gap="xl">
        <Card shadow="sm" padding="lg">
          <Title order={1}>Home</Title>
          <Text mt="md" size="lg">
            Welcome to the home
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
