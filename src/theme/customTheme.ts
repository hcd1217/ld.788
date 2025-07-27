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
  dangerColor: string;
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
      activeColor: '#36B37E',
      dangerColor: '#FF5630',
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
        backgroundColor: '#17233B',
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#3e618c',
          },
          border: '#3E4958',
          background: '#232D40',
          hover: '#17233B',
          inactive: '#222D40',
        },
      },
      inputBorderColor: '#9bc1e7',
      borderColor: '#3e618c',
      activeColor: '#36B37E',
      dangerColor: '#FF5630',
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
      appShell: {
        backgroundColor: '#17233B',
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#3f60a0',
          },
          border: '#3E4958',
          background: '#232D40',
          hover: '#17233B',
          inactive: '#222D40',
        },
      },
      inputBorderColor: '#b8c6e3',
      borderColor: '#3f60a0',
      activeColor: '#36B37E',
      dangerColor: '#FF5630',
      inActiveColor: 'gray',
    },
  },
} as const;

export const defaultConfig = themeConfig.elegant;
