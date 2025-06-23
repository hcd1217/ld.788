import {
  type MantineColorsTuple,
  type MantineTheme,
  type MantineThemeComponent,
  type MantineThemeOverride,
  createTheme,
} from '@mantine/core';

const override: MantineThemeOverride = {};
createColors(override);
createComponents(override);
createTypography(override);
createSpacing(override);

export const theme = createTheme(override);

function createColors(override: MantineThemeOverride) {
  override.colors = {} satisfies Record<string, MantineColorsTuple>;
  
  // Primary blue palette - your favorite color
  override.colors.blue = [
    "#e6f2ff",
    "#cce0ff",
    "#99c2ff",
    "#66a3ff",
    "#3385ff",
    "#0066ff",
    "#0052cc",
    "#003d99",
    "#002966",
    "#001433"
  ];
  
  // Ocean blue - deeper variant
  override.colors.ocean = [
    "#e0f1ff",
    "#c5e4ff",
    "#91caff",
    "#5aafff",
    "#2e96ff",
    "#1185ff",
    "#017aff",
    "#0069e0",
    "#005cc7",
    "#004bac"
  ];
  
  // Sky blue - lighter variant
  override.colors.sky = [
    "#f0f9ff",
    "#e0f2fe",
    "#bae6fd",
    "#7dd3fc",
    "#38bdf8",
    "#0ea5e9",
    "#0284c7",
    "#0369a1",
    "#075985",
    "#0c4a6e"
  ];
  
  // Indigo - complementary
  override.colors.indigo = [
    "#eef2ff",
    "#e0e7ff",
    "#c7d2fe",
    "#a5b4fc",
    "#818cf8",
    "#6366f1",
    "#4f46e5",
    "#4338ca",
    "#3730a3",
    "#312e81"
  ];
  
  // Success green
  override.colors.success = [
    "#e9fcef",
    "#d9f4e1",
    "#b4e6c3",
    "#8cd9a2",
    "#6acd86",
    "#54c674",
    "#48c26a",
    "#38ab59",
    "#2e984d",
    "#1d843f"
  ];
  
  // Error red
  override.colors.error = [
    "#ffebeb",
    "#fad7d7",
    "#eeadad",
    "#e38080",
    "#da5a59",
    "#d54241",
    "#d43534",
    "#bf2828",
    "#a82022",
    "#94151b"
  ];
  
  // Warning amber
  override.colors.warning = [
    "#fffbeb",
    "#fef3c7",
    "#fde68a",
    "#fcd34d",
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#92400e",
    "#78350f"
  ];
  
  // Set primary color
  override.primaryColor = 'blue';
}

function createComponents(override: MantineThemeOverride) {
  override.components = {} satisfies Record<string, MantineThemeComponent>;
  
  override.components.Button = {
    defaultProps: {
      radius: 'md',
    },
    styles: (theme: MantineTheme) => ({
      root: {
        transition: 'all 150ms ease',
        fontWeight: 600,
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: theme.shadows.md,
        },
      },
    }),
  };
  
  override.components.Card = {
    defaultProps: {
      radius: 'md',
      shadow: 'sm',
    },
    styles: (theme: MantineTheme) => ({
      root: {
        transition: 'all 200ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows.lg,
        },
      },
    }),
  };
  
  override.components.Input = {
    defaultProps: {
      radius: 'md',
    },
    styles: (theme: MantineTheme) => ({
      input: {
        borderColor: theme.colors.gray[3],
        '&:focus': {
          borderColor: theme.colors.blue[5],
        },
      },
    }),
  };
  
  override.components.Paper = {
    defaultProps: {
      radius: 'md',
      shadow: 'xs',
    },
  };
  
  override.components.Title = {
    styles: (theme: MantineTheme) => ({
      root: {
        color: theme.colors.gray[8],
        fontWeight: 700,
      },
    }),
  };
  
  override.components.Text = {
    styles: (theme: MantineTheme) => ({
      root: {
        color: theme.colors.gray[7],
      },
    }),
  };
}

function createTypography(override: MantineThemeOverride) {
  override.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  override.fontFamilyMonospace = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace';
  
  override.headings = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.75rem', lineHeight: '1.4' },
      h4: { fontSize: '1.5rem', lineHeight: '1.5' },
      h5: { fontSize: '1.25rem', lineHeight: '1.6' },
      h6: { fontSize: '1rem', lineHeight: '1.7' },
    },
  };
}

function createSpacing(override: MantineThemeOverride) {
  override.spacing = {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  };
  
  override.radius = {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  };
  
  override.shadows = {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.05), 0 10px 10px rgba(0, 0, 0, 0.1)',
  };
}
