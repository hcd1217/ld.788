export type CustomColors = {
  appShell?: {
    menu?: {
      color?: string;
      active?: {
        color?: string;
        background?: string;
      };
      border?: string;
      hover?: string;
      background?: string;
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
      '#fff5e5',
      '#f8e9d4',
      '#edd1ad',
      '#e2b781',
      '#d9a25c',
      '#d39444',
      '#cd872f',
      '#b97929',
      '#a56b21',
      '#905c15',
    ],
    default: {
      appShell: {
        backgroundColor: '#17233B',
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#CD872F',
          },
          border: '#3E4958',
          background: '#232D40',
          hover: '#17233B',
          inactive: '#222D40',
        },
      },
      inputBorderColor: '#e2b781',
      borderColor: '#CD872F',
      activeColor: '#CD872F',
      inActiveColor: 'gray',
    },
  },
  blue: {
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
      appShell: {
        backgroundColor: '#17233B',
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#324e71',
          },
          border: '#3E4958',
          background: '#232D40',
          hover: '#17233B',
          inactive: '#222D40',
        },
      },
      inputBorderColor: '#79aadb',
      borderColor: '#324e71',
      activeColor: '#324e71',
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
      appShell: {
        backgroundColor: '#1a2230',
        color: '#d6e6f7',
        menu: {
          border: '#2b3540',
          background: '#1b1f26',
          hover: '#1a2230',
          active: {
            color: '#d6e6f7',
            background: '#1b1f26',
          },
          inactive: '#2b3038',
        },
      },
      inputBorderColor: '#79aadb',
      borderColor: '#5f91c6',
      activeColor: '#79aadb',
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
} as const;

export const defaultConfig = themeConfig.orange;
