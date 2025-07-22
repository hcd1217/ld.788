export type CustomColors = {
  inputBorderColor: string;
  borderColor: string;
};
type CustomThemeConfig = {
  brandColors: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  default: CustomColors;
  light?: CustomColors;
  dark?: CustomColors;
};

export const themeConfig: Record<string, CustomThemeConfig> = {
  origin: {
    brandColors: [
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
    default: {
      inputBorderColor: '#dee2e6',
      borderColor: '#5173b8',
    },
    light: {
      inputBorderColor: '#dee2e6',
      borderColor: '#5173b8',
    },
    dark: {
      inputBorderColor: '#c5c5c5',
      borderColor: '#5173b8',
    },
  },
  elegant: {
    brandColors: [
      '#eaf3fb', // [0] lightest
      '#d6e6f7', // [1]
      '#bcd6f0', // [2]
      '#9bc1e7', // [3]
      '#79aadb', // [4]
      '#5f91c6', // [5]
      '#4a76a9', // [6]
      '#3e618c', // [7]
      '#324e71', // [8]
      '#273c59', // [9] darkest
    ],
    default: {
      inputBorderColor: '#dee2e6',
      borderColor: '#4a76a9',
    },
    light: {
      inputBorderColor: '#dee2e6',
      borderColor: '#4a76a9',
    },
    dark: {
      inputBorderColor: '#dee2e6',
      borderColor: '#4a76a9',
    },
  },
} as const;

export const defaultConfig = themeConfig.origin;
// Export const defaultConfig = themeConfig.elegant
