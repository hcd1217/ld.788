import {
  Button,
  createTheme,
  PasswordInput,
  rem,
  TextInput,
  type CSSVariablesResolver,
} from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: [
      '#ecf4ff',
      '#dce4f4',
      '#b8c6e3',
      '#91a7d2',
      '#708cc4',
      '#5b7bbb',
      '#5073b8',
      '#3f60a0',
      '#365793',
      '#294b83',
    ],
  },
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    PasswordInput: PasswordInput.extend({
      styles() {
        return {
          input: {
            border: 'none',
            borderBottom: '1px solid var(--input-border-color)',
            borderRadius: 0,
            padding: 0,
          },
          innerInput: {
            padding: 0,
          },
        };
      },
    }),
    TextInput: TextInput.extend({
      styles() {
        return {
          input: {
            border: 'none',
            borderBottom: '1px solid var(--input-border-color)',
            borderRadius: 0,
            padding: '12px 0',
          },
        };
      },
    }),
    Button: Button.extend({
      styles(_theme, props) {
        if (props.variant === 'auth-form') {
          return {
            root: {
              transition: 'all 0.2s ease',
              height: rem(55),
              fontSize: 'h4',
              fontWeight: '400',
            },
          };
        }

        return {};
      },
    }),
  },
});

export const resolver: CSSVariablesResolver = () => ({
  variables: {
    '--input-border-color': '#dee2e6',
  },
  light: {
    '--input-border-color': '#dee2e6',
  },
  dark: {
    '--input-border-color': '#c5c5c5',
  },
});
