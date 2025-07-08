import {forwardRef} from 'react';
import {
  TextInput,
  PasswordInput,
  useMantineColorScheme,
  type TextInputProps,
  type PasswordInputProps,
} from '@mantine/core';

type BaseAuthFormInputProps = {
  readonly type?: 'text' | 'email' | 'password';
  readonly onFocus?: () => void;
};

type AuthFormInputProps = BaseAuthFormInputProps &
  Omit<TextInputProps, 'variant' | 'styles' | 'type'>;

const getInputStyles = (colorScheme: string) => ({
  input: {
    borderBottom: `1px solid ${colorScheme === 'dark' ? '#c5c5c5' : '#dee2e6'}`,
    borderRadius: 0,
    padding: '12px 0',
  },
});

export const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({type = 'text', onFocus = undefined, ...props}, ref) => {
    const {colorScheme} = useMantineColorScheme();
    const inputStyles = getInputStyles(colorScheme);

    if (type === 'password') {
      return (
        <PasswordInput
          ref={ref}
          variant="unstyled"
          styles={inputStyles}
          onFocus={onFocus}
          {...(props as PasswordInputProps)}
        />
      );
    }

    return (
      <TextInput
        ref={ref}
        type={type}
        variant="unstyled"
        styles={inputStyles}
        onFocus={onFocus}
        {...props}
      />
    );
  },
);

AuthFormInput.displayName = 'AuthFormInput';
