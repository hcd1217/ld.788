import {Group, Title, Box} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useState, useEffect} from 'react';
import {useAppStore} from '@/stores/useAppStore';

type AppLogoProps = {
  readonly c?: string;
  readonly link?: string;
};
export function AppLogo({c, link = '/home'}: AppLogoProps) {
  const navigate = useNavigate();
  const {publicClientConfig} = useAppStore();
  const [title, setTitle] = useState('Credo');
  const [logoUrl, setLogoUrl] = useState('/logo-black-and-white.svg');

  useEffect(() => {
    if (publicClientConfig?.clientName) {
      setTitle(publicClientConfig.clientName);
    }

    if (publicClientConfig?.logoUrl) {
      setLogoUrl(publicClientConfig?.logoUrl);
    }
  }, [publicClientConfig]);

  return (
    <Group gap="xs" style={{cursor: 'pointer'}} onClick={() => navigate(link)}>
      <Box
        component="img"
        src={logoUrl || '/logo-black-and-white.svg'}
        alt="Logo"
        style={{
          width: 30,
          height: 30,
        }}
      />
      <Title order={3} c={c}>
        {title}
      </Title>
    </Group>
  );
}
