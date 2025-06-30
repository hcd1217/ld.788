import {Title, Text, Container, Card} from '@mantine/core';

export function ExplorePage() {
  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Explore</Title>
        <Text mt="md" size="lg">
          Welcome to the explore page
        </Text>
      </Card>
    </Container>
  );
}
