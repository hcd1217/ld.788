import {
  Button,
  createTheme,
  PasswordInput,
  rem,
  TextInput,
  type CSSVariablesResolver,
} from '@mantine/core';
import {defaultConfig, type CustomColors} from './customTheme';

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

export const resolver: CSSVariablesResolver = () => ({
  variables: _build(defaultConfig.default),
  light: _build(
    defaultConfig.light ?? defaultConfig.default,
    defaultConfig.default,
  ),
  dark: _build(
    defaultConfig.dark ?? defaultConfig.default,
    defaultConfig.default,
  ),
});

function _build(colors: CustomColors, defaultColors?: CustomColors) {
  return {
    '--app-danger-color': colors.dangerColor,
    '--app-active-color': colors.activeColor,
    '--app-inactive-color': colors.inActiveColor,
    '--app-shell-background-color':
      colors.appShell?.backgroundColor ??
      defaultColors?.appShell?.backgroundColor ??
      'white',
    '--app-shell-color':
      colors.appShell?.color ?? defaultColors?.appShell?.color ?? 'white',
    '--box-shadow-color':
      colors.borderColor ?? defaultColors?.borderColor ?? 'transparent',
    '--card-border-color':
      colors.borderColor ?? defaultColors?.borderColor ?? 'transparent',
    '--input-border-color': colors.inputBorderColor,
    '--menu-active-color':
      colors.appShell?.menu?.active?.color ??
      defaultColors?.appShell?.menu?.active?.color ??
      '',
    '--menu-active-background-color':
      colors.appShell?.menu?.active?.background ??
      defaultColors?.appShell?.menu?.active?.background ??
      '',
    '--menu-color':
      colors.appShell?.menu?.color ??
      defaultColors?.appShell?.menu?.color ??
      '',
    '--menu-background-color':
      colors.appShell?.menu?.background ??
      defaultColors?.appShell?.menu?.background ??
      'transparent',
    '--menu-hover-color':
      colors.appShell?.menu?.hover ??
      defaultColors?.appShell?.menu?.hover ??
      'transparent',
    '--menu-border-color':
      colors.appShell?.menu?.border ??
      defaultColors?.appShell?.menu?.border ??
      'transparent',
    '--menu-inactive-color':
      colors.appShell?.menu?.inactive ??
      defaultColors?.appShell?.menu?.inactive ??
      'transparent',
  };
}
