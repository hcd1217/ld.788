import React from 'react';

import { Button, Group, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import { GoBack } from '../navigation/GoBack';

type ButtonProps = {
  readonly label: string;
  readonly disabled?: boolean;
  readonly icon?: React.ReactNode;
  readonly onClick?: () => void;
  readonly variant?: 'filled' | 'outline' | 'light' | 'default' | 'subtle' | 'white';
  readonly color?: string;
};

type AppPageTitleProps = {
  readonly title: string;
  readonly withGoBack?: boolean;
  readonly route?: string;
  readonly button?: ButtonProps;
  readonly buttons?: readonly ButtonProps[];
  readonly fz?: string;
};

export function AppPageTitle({ title, button, buttons, fz, withGoBack, route }: AppPageTitleProps) {
  // Support both single button and multiple buttons
  const buttonList = buttons ?? (button ? [button] : []);

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

      {buttonList.length > 0 ? (
        <Group gap="xs">
          {buttonList.map((btn, index) => (
            <Button
              key={index}
              disabled={btn.disabled}
              leftSection={btn.icon ?? <IconPlus size={16} />}
              onClick={btn.onClick}
              variant={btn.variant}
              color={btn.color}
            >
              {btn.label}
            </Button>
          ))}
        </Group>
      ) : (
        <div />
      )}
    </Group>
  );
}
