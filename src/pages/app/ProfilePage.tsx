import {Title, Text, Container, Button, Card, Group} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const {user, logout} = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <Container size="sm" mt="xl">
        <Card shadow="sm" padding="lg">
          <Title order={2}>Not Logged In</Title>
          <Text mt="md">Please log in to view your profile.</Text>
          <Button mt="md" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" padding="lg">
        <Title order={1}>Profile</Title>
        <Text mt="md" size="lg">
          Email: {user.email}
        </Text>
        <Text size="lg">Email: {user.email}</Text>
        <Group mt="xl">
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Card>
    </Container>
  );
}
