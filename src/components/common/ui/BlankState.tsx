import { Title, Stack, Card, Button, Text } from '@mantine/core';
import React from 'react';
import { IconPlus } from '@tabler/icons-react';

type BlankStateProps = {
  readonly hidden?: boolean;
  readonly title: string;
  readonly description?: string;
  readonly button?: {
    readonly label: string;
    readonly disabled?: boolean;
    readonly onClick: () => void;
    readonly icon?: React.ReactNode;
  };
};

export function BlankState({ hidden, title, description, button }: BlankStateProps) {
  if (hidden) {
    return null;
  }

  return (
    <Card shadow="sm" padding="xl" radius="md" ta="center">
      <Stack gap="md">
        <div>
          <Title order={3} c="dimmed">
            {title}
          </Title>
          {description ? (
            <Text c="dimmed" mt="xs">
              {description}
            </Text>
          ) : null}
        </div>
        {button ? (
          <Button
            disabled={button.disabled}
            leftSection={button.icon ?? <IconPlus size={16} />}
            mt="md"
            onClick={button.onClick}
          >
            {button.label}
          </Button>
        ) : null}
      </Stack>
    </Card>
  );
}
