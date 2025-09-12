import { type ReactElement } from 'react';

import { Button, Stack, Text, Title } from '@mantine/core';

import { AuthHeader } from './AuthHeader';

type AuthSuccessStateProps = {
  readonly icon: ReactElement;
  readonly title: string;
  readonly description: string;
  readonly subDescription?: string;
  readonly buttonText: string;
  readonly onButtonClick: () => void;
};

export function AuthSuccessState({
  icon,
  title,
  description,
  subDescription,
  buttonText,
  onButtonClick,
}: AuthSuccessStateProps) {
  return (
    <>
      <AuthHeader />
      <Stack gap="md" align="center" ta="center">
        {icon}
        <Title order={3}>{title}</Title>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
        {subDescription ? (
          <Text size="xs" c="dimmed">
            {subDescription}
          </Text>
        ) : null}
        <Button variant="light" type="button" onClick={onButtonClick}>
          {buttonText}
        </Button>
      </Stack>
    </>
  );
}
