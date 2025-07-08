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
  fw = '400',
  fz = 'h4',
  ...props
}: AuthFormButtonProps) {
  return (
    <Button
      fullWidth
      loading={loading}
      type={type}
      size="md"
      fw={fw}
      fz={fz}
      styles={{
        root: {
          transition: 'all 0.2s ease',
          height: rem(55),
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
