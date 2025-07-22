import {
  Button,
  createTheme,
  PasswordInput,
  rem,
  TextInput,
  type CSSVariablesResolver,
} from '@mantine/core';
import {defaultConfig} from './customTheme';

export const theme = createTheme({
  primaryColor: 'brand',
  colors: {
    brand: defaultConfig.brandColors,
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
      styles(_theme, props) {
        const styles = {
          input: {
            border: 'none',
            borderBottom: '1px solid var(--input-border-color)',
            borderRadius: 0,
            padding: '0',
          },
          innerInput: {
            padding: '0',
          },
        };
        if (props.leftSection) {
          styles.innerInput.padding = '0.5rem 2rem';
        }

        return styles;
      },
    }),
    TextInput: TextInput.extend({
      styles(_theme, props) {
        const styles = {
          input: {
            border: 'none',
            borderBottom: '1px solid var(--input-border-color)',
            borderRadius: 0,
            padding: '0',
          },
        };
        if (props.leftSection) {
          styles.input.padding = '.5rem 2rem';
        }

        return styles;
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

const defaultColors = defaultConfig.default;
const lightColors = defaultConfig.light ?? defaultColors;
const darkColors = defaultConfig.dark ?? defaultColors;
export const resolver: CSSVariablesResolver = () => ({
  variables: {
    '--input-border-color': defaultColors.inputBorderColor,
    '--card-border-color': defaultColors.borderColor,
    '--box-shadow-color': defaultColors.borderColor,
  },
  light: {
    '--input-border-color': lightColors.inputBorderColor,
    '--card-border-color': lightColors.borderColor,
    '--box-shadow-color': lightColors.borderColor,
  },
  dark: {
    '--input-border-color': darkColors.inputBorderColor,
    '--card-border-color': darkColors.borderColor,
    '--box-shadow-color': darkColors.borderColor,
  },
});
