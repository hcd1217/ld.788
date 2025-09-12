import React from 'react';

import { Button, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { GoBack } from '../navigation/GoBack';

type AppPageTitleProps = {
  readonly title: string;
  readonly withGoBack?: boolean;
  readonly route?: string;
  readonly button?: {
    readonly label: string;
    readonly disabled?: boolean;
    readonly icon?: React.ReactNode;
    readonly onClick?: () => void;
  };
  readonly fz?: string;
};

export function AppPageTitle({ title, button, fz, withGoBack, route }: AppPageTitleProps) {
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
        {withGoBack ? <GoBack route={route} variant="icon" /> : null}
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
        <Button
          disabled={button.disabled}
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
