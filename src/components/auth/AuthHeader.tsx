import {Group, Title} from '@mantine/core';
import {Logo} from '@/components/common';

type AuthHeaderProps = {
  readonly title?: string;
};

export function AuthHeader({title = 'Credo'}: AuthHeaderProps) {
  return (
    <Group justify="center" gap="md" mb="lg">
      <Logo />
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
