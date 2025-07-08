import {forwardRef} from 'react';
import {
  TextInput,
  PasswordInput,
  type TextInputProps,
  type PasswordInputProps,
} from '@mantine/core';
import {useIsDarkMode} from '@/hooks/useIsDarkMode';

type BaseAuthFormInputProps = {
  readonly type?: 'text' | 'email' | 'password';
  readonly onFocus?: () => void;
};

type AuthFormInputProps = BaseAuthFormInputProps &
  Omit<TextInputProps, 'variant' | 'styles' | 'type'>;

const getInputStyles = (isDarkMode: boolean) => ({
  input: {
    borderBottom: `1px solid ${isDarkMode ? '#c5c5c5' : '#dee2e6'}`,
    borderRadius: 0,
    padding: '12px 0',
  },
});

export const AuthFormInput = forwardRef<HTMLInputElement, AuthFormInputProps>(
  ({type = 'text', onFocus = undefined, ...props}, ref) => {
    const isDarkMode = useIsDarkMode();
    const inputStyles = getInputStyles(isDarkMode);

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
