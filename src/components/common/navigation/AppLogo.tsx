import {Group, Title, Box} from '@mantine/core';
import {useNavigate} from 'react-router';
import {useState, useEffect} from 'react';
import {useClientConfig} from '@/stores/useAppStore';

type AppLogoProps = {
  readonly c?: string;
  readonly link?: string;
};
export function AppLogo({c, link = '/home'}: AppLogoProps) {
  const navigate = useNavigate();
  const clientConfig = useClientConfig();
  const [title, setTitle] = useState('Credo');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');

  useEffect(() => {
    if (clientConfig?.clientName) {
      setTitle(clientConfig.clientName);
    }

    if (clientConfig?.logoUrl) {
      setLogoUrl(clientConfig?.logoUrl);
    }
  }, [clientConfig]);

  return (
    <Group gap="xs" style={{cursor: 'pointer'}} onClick={() => navigate(link)}>
      <Box
        component="img"
        src={logoUrl || '/logo.svg'}
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
