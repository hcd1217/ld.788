import {Group, Title, Box} from '@mantine/core';
import {useNavigate} from 'react-router';

export function AppLogo() {
  const navigate = useNavigate();

  return (
    <Group
      gap="xs"
      style={{cursor: 'pointer'}}
      onClick={() => navigate('/home')}
    >
      <Box
        component="img"
        src="/logo.svg"
        alt="Logo"
        style={{
          width: 30,
          height: 30,
        }}
      />
      <Title order={3}>Credo</Title>
    </Group>
  );
}
