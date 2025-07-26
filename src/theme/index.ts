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
  // Cspell:words Noto Consolas
  fontFamily:
    '"Noto Sans", Consolas, Monaco, "Courier New", monospace, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  headings: {
    fontFamily:
      '"Noto Sans", Consolas, Monaco, "Courier New", monospace, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
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

const variables = {
  '--input-border-color': defaultColors.inputBorderColor,
  '--menu-background-color': defaultColors.appShell?.color ?? 'white',
  '--menu-active-color': defaultColors.appShell?.menu?.active ?? '',
  '--menu-inactive-color':
    defaultColors.appShell?.menu?.inactive ?? 'transparent',
  '--menu-border-color': defaultColors.appShell?.menu?.border ?? 'transparent',
  '--app-shell-background-color':
    defaultColors.appShell?.backgroundColor ?? 'white',
  '--app-shell-color': defaultColors.appShell?.color ?? 'white',
  '--card-border-color': defaultColors.borderColor,
  '--box-shadow-color': defaultColors.borderColor,
  '--app-active-color': defaultColors.activeColor,
  '--app-in-active-color': defaultColors.inActiveColor,
};
const light = {
  '--input-border-color': lightColors.inputBorderColor,
  '--menu-background-color': lightColors.appShell?.color ?? 'white',
  '--menu-active-color': lightColors.appShell?.menu?.active ?? '',
  '--menu-inactive-color':
    lightColors.appShell?.menu?.inactive ?? 'transparent',
  '--menu-border-color': lightColors.appShell?.menu?.border ?? 'transparent',
  '--app-shell-background-color':
    lightColors.appShell?.backgroundColor ?? 'white',
  '--app-shell-color': lightColors.appShell?.color ?? 'white',
  '--card-border-color': lightColors.borderColor,
  '--box-shadow-color': lightColors.borderColor,
  '--app-active-color': lightColors.activeColor,
  '--app-in-active-color': lightColors.inActiveColor,
};
const dark = {
  '--input-border-color': darkColors.inputBorderColor,
  '--menu-background-color': darkColors.appShell?.color ?? 'white',
  '--menu-active-color': darkColors.appShell?.menu?.active ?? '',
  '--menu-inactive-color': darkColors.appShell?.menu?.inactive ?? 'transparent',
  '--menu-border-color': darkColors.appShell?.menu?.border ?? 'transparent',
  '--app-shell-background-color':
    darkColors.appShell?.backgroundColor ?? 'white',
  '--app-shell-color': darkColors.appShell?.color ?? 'white',
  '--card-border-color': darkColors.borderColor,
  '--box-shadow-color': darkColors.borderColor,
  '--app-active-color': darkColors.activeColor,
  '--app-in-active-color': darkColors.inActiveColor,
};
export const resolver: CSSVariablesResolver = () => ({
  variables,
  light,
  dark,
});
