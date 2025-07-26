export type CustomColors = {
  backgroundColor?: {
    menu?: string;
    appShell?: string;
  };
  color?: {
    appShell?: string;
  };
  appShell?: {
    menu?: {
      border?: string;
      active?: string;
      inactive?: string;
    };
    backgroundColor?: string;
    color?: string;
  };
  inputBorderColor: string;
  borderColor: string;
  activeColor: string;
  inActiveColor: string;
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
  orange: {
    brandColors: [
      '#fff4e6',
      '#f9e7d5',
      '#efceac',
      '#e5b47f',
      '#dd9d59',
      '#d98e40',
      '#d78732',
      '#c07525',
      '#aa661d',
      '#945712',
    ],
    default: {
      appShell: {
        backgroundColor: '#1a2230',
        color: '#c9c9c9',
        menu: {
          border: '#1b1f30',
          active: '#d78732',
          inactive: '#1b1f26',
          // Active?: string;
          // inactive?: string;
        },
      },
      backgroundColor: {
        menu: '#222',
        appShell: '#1a2230',
      },
      color: {
        appShell: 'white',
      },
      inputBorderColor: '#fac0a1',
      borderColor: '#c07525',
      activeColor: '#d78732',
      inActiveColor: 'gray',
    },
  },
  tomato: {
    brandColors: [
      '#fff0e4',
      '#ffe0cf',
      '#fac0a1',
      '#f69e6e',
      '#f28043',
      '#f06e27',
      '#f06418',
      '#d6530c',
      '#bf4906',
      '#a73c00',
    ],
    default: {
      appShell: {
        backgroundColor: '#1a2230',
        color: '#c9c9c9',
        menu: {
          active: '#f28043',
          inactive: '#1a2230',
        },
      },
      backgroundColor: {
        menu: '#222',
        appShell: '#1a2230',
      },
      color: {
        appShell: '#c9c9c9',
      },
      inputBorderColor: '#fac0a1',
      borderColor: '#d6530c',
      activeColor: '#f06e27',
      inActiveColor: 'gray',
    },
    light: {
      appShell: {
        backgroundColor: '#1a2230',
        color: '#c9c9c9',
        menu: {
          active: '#f28043',
          inactive: '#1a2230',
        },
      },
      backgroundColor: {
        menu: '#222',
        appShell: '#1a2230',
      },
      color: {
        appShell: 'white',
      },
      inputBorderColor: '#fac0a1',
      borderColor: '#d6530c',
      activeColor: '#f06e27',
      inActiveColor: 'gray',
    },
    dark: {
      appShell: {
        backgroundColor: '#1a2230',
        color: '#c9c9c9',
        menu: {
          active: '#f28043',
          inactive: '#1a2230',
        },
      },
      backgroundColor: {
        menu: '#222',
        appShell: '#1a2230',
      },
      color: {
        appShell: 'white',
      },
      inputBorderColor: '#fac0a1',
      borderColor: '#d6530c',
      activeColor: '#f06e27',
      inActiveColor: 'gray',
    },
  },
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
      activeColor: 'green',
      inActiveColor: 'gray',
    },
    light: {
      inputBorderColor: '#dee2e6',
      borderColor: '#5173b8',
      activeColor: 'green',
      inActiveColor: 'gray',
    },
    dark: {
      inputBorderColor: '#c5c5c5',
      borderColor: '#5173b8',
      activeColor: 'green',
      inActiveColor: 'gray',
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
      activeColor: 'green',
      inActiveColor: 'gray',
    },
    light: {
      inputBorderColor: '#dee2e6',
      borderColor: '#4a76a9',
      activeColor: 'green',
      inActiveColor: 'gray',
    },
    dark: {
      inputBorderColor: '#dee2e6',
      borderColor: '#4a76a9',
      activeColor: 'green',
      inActiveColor: 'gray',
    },
  },
} as const;

export const defaultConfig = themeConfig.orange;
