import {
  Title,
  Text,
  Container,
  Button,
  Card,
  Group,
  Box,
  Stack,
} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useAppStore} from '@/stores/useAppStore';

export function ProfilePage() {
  const navigate = useNavigate();
  const {isAuthenticated, user, logout} = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <Container fluid mt="xl">
        <Stack gap="xl">
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              padding: '0 16px',
            }}
          >
            <Box style={{maxWidth: '600px', width: '100%'}}>
              <Card shadow="sm" padding="lg">
                <Title order={2}>Not Logged In</Title>
                <Text mt="md">Please log in to view your profile.</Text>
                <Button mt="md" onClick={() => navigate('/')}>
                  Go to Home
                </Button>
              </Card>
            </Box>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            padding: '0 16px',
          }}
        >
          <Box style={{maxWidth: '600px', width: '100%'}}>
            <Card shadow="sm" padding="lg">
              <Title order={1}>Profile</Title>
              <Text mt="md" size="lg">
                Email: {user?.email}
              </Text>
              <Text size="lg">Email: {user?.email}</Text>
              <Group mt="xl">
                <Button color="red" onClick={handleLogout}>
                  Logout
                </Button>
              </Group>
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
