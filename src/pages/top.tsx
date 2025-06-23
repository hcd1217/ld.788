import { Container, Stack, Title, Text, Button, Group, Center } from '@mantine/core';
import { IconClock, IconCode } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

export default function Top() {
  const navigate = useNavigate();

  return (
    <Container size="md" h="100vh">
      <Center h="100%">
        <Stack align="center" gap="xl">
          <Title order={1} size={48} fw={800} ta="center">
            Welcome to Consocia
          </Title>
          <Text size="xl" c="dimmed" ta="center" maw={600}>
            Choose a demo to explore our features
          </Text>
          <Group mt="lg">
            <Button
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: 'indigo', to: 'purple' }}
              leftSection={<IconClock size={20} />}
              onClick={() => navigate('/c-time-keepers')}
            >
              C-Time Keepers
            </Button>
            <Button
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: 'ocean', to: 'sky' }}
              leftSection={<IconCode size={20} />}
              onClick={() => navigate('/sample')}
            >
              Sample Page
            </Button>
          </Group>
        </Stack>
      </Center>
    </Container>
  );
}
