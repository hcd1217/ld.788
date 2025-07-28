import {Title, Group, Button} from '@mantine/core';
import {IconPlus} from '@tabler/icons-react';
import React from 'react';

type AppPageTitleProps = {
  readonly title: string;
  readonly button?: {
    readonly label: string;
    readonly onClick?: () => void;
    readonly icon?: React.ReactNode;
  };
};

export function AppPageTitle({title, button}: AppPageTitleProps) {
  return (
    <Group justify="space-between" align="center">
      <Title
        order={1}
        ta="center"
        fz={{
          base: 'h3',
          sm: 'h3',
          md: 'h2',
        }}
      >
        {title}
      </Title>
      {button ? (
        <Button
          leftSection={button.icon ?? <IconPlus size={16} />}
          onClick={button.onClick}
        >
          {button.label}
        </Button>
      ) : (
        <div />
      )}
    </Group>
  );
}
