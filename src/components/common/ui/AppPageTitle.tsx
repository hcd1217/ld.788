import { Title, Group, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import React from 'react';
import { GoBack } from '../navigation/GoBack';

type AppPageTitleProps = {
  readonly title: string;
  readonly withGoBack?: boolean;
  readonly button?: {
    readonly label: string;
    readonly onClick?: () => void;
    readonly icon?: React.ReactNode;
  };
  readonly fz?: string;
};

export function AppPageTitle({ title, button, fz, withGoBack }: AppPageTitleProps) {
  return (
    <Group
      justify="space-between"
      align="center"
      mb={{
        base: 0,
        sm: 'xs',
        md: 'lg',
      }}
    >
      <Group>
        {withGoBack ? <GoBack variant="icon" /> : null}
        <Title
          order={1}
          ta="center"
          fz={
            fz ?? {
              base: 'h4',
              sm: 'h4',
              md: 'h3',
            }
          }
        >
          {title}
        </Title>
      </Group>

      {button ? (
        <Button leftSection={button.icon ?? <IconPlus size={16} />} onClick={button.onClick}>
          {button.label}
        </Button>
      ) : (
        <div />
      )}
    </Group>
  );
}
