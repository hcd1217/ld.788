import {type ReactNode} from 'react';
import {Button, rem, type ButtonProps} from '@mantine/core';

type AuthFormButtonProps = {
  readonly children: ReactNode;
  readonly loading?: boolean;
  readonly type?: 'submit' | 'button';
  readonly onClick?: () => void;
} & Omit<ButtonProps, 'fullWidth' | 'size' | 'styles'>;

export function AuthFormButton({
  children,
  loading = false,
  type = 'submit',
  ...props
}: AuthFormButtonProps) {
  return (
    <Button
      fullWidth
      loading={loading}
      type={type}
      size="md"
      styles={{
        root: {
          transition: 'all 0.2s ease',
          height: rem(42),
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
