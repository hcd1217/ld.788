import {forwardRef} from 'react';
import {
  TextInput,
  PasswordInput,
  type TextInputProps,
  type PasswordInputProps,
} from '@mantine/core';

type BaseAuthFormInputProps = {
  readonly type?: 'text' | 'email' | 'password';
  readonly onFocus?: () => void;
};

type AuthFormInputProps = BaseAuthFormInputProps &
  Omit<TextInputProps, 'variant' | 'styles' | 'type'>;

const inputStyles = {
  input: {
    borderBottom: '1px solid #dee2e6',
    borderRadius: 0,
    padding: '12px 0',
  },
};

export const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({type = 'text', onFocus, ...props}, ref) => {
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