import { Group, Title } from '@mantine/core';
import { useLogoAndTitle } from '@/hooks/useLogoAndTitle';

type AuthHeaderProps = {
  readonly title?: string;
};

export function AuthHeader({ title: pageTitle }: AuthHeaderProps) {
  const { logoUrl, title } = useLogoAndTitle({ color: true });
  // Use environment variable as default fallback
  const defaultAppName = import.meta.env.VITE_APP_NAME || 'Credo';
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
        {pageTitle || title || defaultAppName}
      </Title>
    </Group>
  );
}
