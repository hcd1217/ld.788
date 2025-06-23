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

export const theme = createTheme(override);

function createColors(override: MantineThemeOverride) {
  override.colors = {} satisfies Record<string, MantineColorsTuple>;
  override.colors.success =
  // https://mantine.dev/colors-generator/?color=047529
  [
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
  override.colors.error =
  [
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
  ]
}

function createComponents(override: MantineThemeOverride) {
  override.components = {} satisfies Record<string, MantineThemeComponent>;
  override.components.Button = {
    styles: (theme: MantineTheme) => ({
      root: {
        borderRadius: theme.radius.sm,
      },
    }),
  };
}
