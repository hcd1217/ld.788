import {Group, Title} from '@mantine/core';
import {useEffect, useState} from 'react';
import {useAppStore} from '@/stores/useAppStore';

type AuthHeaderProps = {
  readonly title?: string;
};

export function AuthHeader({title: pageTitle = 'Credo'}: AuthHeaderProps) {
  const {publicClientConfig} = useAppStore();
  const [title, setTitle] = useState(pageTitle);
  const [logoUrl, setLogoUrl] = useState('/logo.svg');

  useEffect(() => {
    setTitle(publicClientConfig?.clientName ?? title);
    if (publicClientConfig?.logoUrl) {
      setLogoUrl(publicClientConfig?.logoUrl);
    }
  }, [publicClientConfig, title]);

  return (
    <Group justify="center" gap="md" mb="lg">
      <img
        src={logoUrl}
        alt={title}
        style={{
          width: 36,
          height: 36,
          borderRadius: '8px',
        }}
      />
      <Title
        style={{
          fontWeight: 900,
        }}
        size="h2"
      >
        {title}
      </Title>
    </Group>
  );
}
