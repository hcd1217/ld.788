import {Group, Title, Box} from '@mantine/core';
import {useNavigate} from 'react-router';

type AppLogoProps = {
  readonly link?: string;
};
export function AppLogo({link = '/home'}: AppLogoProps) {
  const navigate = useNavigate();

  return (
    <Group gap="xs" style={{cursor: 'pointer'}} onClick={() => navigate(link)}>
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
