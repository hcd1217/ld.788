import {Title, Text, Container, Card} from '@mantine/core';

export function HomePage() {
  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Home</Title>
        <Text mt="md" size="lg">
          Welcome to the home page
        </Text>
      </Card>
    </Container>
  );
}
