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
  brandColors: [string, string, string, string, string, string, string, string, string, string];
  default: CustomColors;
  light?: CustomColors;
  dark?: CustomColors;
};

export const themeConfig: Record<string, CustomThemeConfig> = {
  orange: {
    brandColors: [
      '#f9f3eb', // [0] lightest
      '#f3e3ce', // [1]
      '#e9cca2', // [2]
      '#e0b474', // [3]
      '#d89b4a', // [4]
      '#c78936', // [5]
      '#b5792c', // [6]
      '#b97929', // [7] main
      '#955f22', // [8]
      '#73491a', // [9] darkest
    ],
    default: {
      appShell: {
        backgroundColor: '#2b2116', // dark brown background
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#b97929',
          },
          border: '#3a2f24', // deep brown-gray border
          background: '#35281d', // menu background dark brown
          hover: '#2b2116', // same as main background
          inactive: '#2e2419', // slightly lighter than background
        },
      },
      inputBorderColor: '#e0b474',
      borderColor: '#b97929',
      dangerColor: '#FF5630',
      activeColor: '#2b8a3e',
      inActiveColor: '#2e2e2e',
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
      dangerColor: '#F2340A',
      activeColor: '#2b8a3e',
      inActiveColor: '#F2340A',
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
  timeKeeper: {
    brandColors: [
      '#e6f5ef', // [0] lightest
      '#c9ebde', // [1]
      '#a6e0cb', // [2]
      '#80d4b4', // [3]
      '#5ac99d', // [4]
      '#44b287', // [5]
      '#359672', // [6]
      '#26956d', // [7] main
      '#1f7658', // [8]
      '#175b44', // [9] darkest
    ],
    default: {
      appShell: {
        backgroundColor: '#12261E', // dark green background
        color: '#ffffff',
        menu: {
          color: '#D9D9D9',
          active: {
            color: '#ffffff',
            background: '#26956d',
          },
          border: '#2C3A34', // muted green-gray border
          background: '#1A2F26', // menu background dark green
          hover: '#12261E', // same as main background
          inactive: '#192E25', // slightly lighter than background
        },
      },
      inputBorderColor: '#80d4b4',
      borderColor: '#26956d',
      dangerColor: '#FF5630',
      activeColor: '#2b8a3e',
      inActiveColor: '#2e2e2e',
    },
  },
} as const;
