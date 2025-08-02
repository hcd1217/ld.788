import zustandStableSelector from './zustand-stable-selector.js';
import noReactImport from './no-react-import.js';

export const rules = {
  'zustand-stable-selector': zustandStableSelector,
  'no-react-import': noReactImport,
};

export const configs = {
  recommended: {
    rules: {
      'custom/zustand-stable-selector': 'error',
      'custom/no-react-import': 'error',
    },
  },
};

const plugin = {
  rules,
  configs,
};

export default plugin;