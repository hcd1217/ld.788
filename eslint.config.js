import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import promise from 'eslint-plugin-promise';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import customPlugin from './eslint-rules/index.js';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'coverage', 'eslint.config.js', '*.local'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['vite.config.ts'],
    settings: {
      react: {
        version: 'detect',
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.app.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react: react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
      custom: customPlugin,
      unicorn: unicorn,
      promise: promise,
      import: importPlugin,
      n: n,
    },
    rules: {
      // Custom rules
      'custom/zustand-stable-selector': 'error',
      'custom/no-react-import': 'error',

      // Base XO rules (using XO's recommended settings)
      ...js.configs.recommended.rules,
      
      // TypeScript rules from XO
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs.strict.rules,
      
      // XO Unicorn plugin rules - more balanced selection
      'unicorn/better-regex': 'warn',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'warn',
      'unicorn/consistent-function-scoping': 'off', // Often better to keep functions in component scope
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/explicit-length-check': 'warn',
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-callback-reference': 'off', // Too strict for existing code
      'unicorn/no-array-for-each': 'off', // forEach is fine in many cases
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-await-expression-member': 'error',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-document-cookie': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-for-loop': 'warn',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-lonely-if': 'warn',
      'unicorn/no-nested-ternary': 'warn',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-null': 'off',
      'unicorn/no-process-exit': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unreadable-array-destructuring': 'error',
      'unicorn/no-unreadable-iife': 'error',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/no-useless-undefined': 'off', // Common pattern in TypeScript
      'unicorn/no-zero-fractions': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': 'off', // Style preference
      'unicorn/prefer-add-event-listener': 'warn',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'warn',
      'unicorn/prefer-array-flat-map': 'warn',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-at': 'warn',
      'unicorn/prefer-code-point': 'warn',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-dom-node-append': 'warn',
      'unicorn/prefer-dom-node-dataset': 'warn',
      'unicorn/prefer-dom-node-remove': 'warn',
      'unicorn/prefer-dom-node-text-content': 'warn',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-keyboard-event-key': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'warn',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-modern-dom-apis': 'warn',
      'unicorn/prefer-modern-math-apis': 'warn',
      'unicorn/prefer-native-coercion-functions': 'warn',
      'unicorn/prefer-negative-index': 'warn',
      'unicorn/prefer-node-protocol': 'off', // Not relevant for browser code
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-object-from-entries': 'warn',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-query-selector': 'warn',
      'unicorn/prefer-reflect-apply': 'off',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'warn',
      'unicorn/prefer-set-size': 'warn',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-replace-all': 'warn',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-switch': 'off', // else-if chains can be clearer
      'unicorn/prefer-ternary': 'off', // Sometimes if-else is clearer
      'unicorn/prefer-type-error': 'error',
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      'unicorn/switch-case-braces': 'warn',
      'unicorn/template-indent': 'off', // Handled by prettier
      'unicorn/text-encoding-identifier-case': 'error',
      'unicorn/throw-new-error': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/require-default-props': 'off', // Not needed with TypeScript
      'react/boolean-prop-naming': 'off', // From XO config

      // React hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-unused-vars': 'off',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Rules disabled in xo.config.ts - apply them here too
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-dynamic-delete': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // XO unicorn rules that are disabled in xo.config.ts
      'unicorn/filename-case': 'off',
      'unicorn/import-style': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-blob-reading-methods': 'off',
      'unicorn/prefer-export-from': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/prevent-abbreviations': 'off',

      // Other disabled rules from XO config
      'no-await-in-loop': 'off',
      'no-control-regex': 'off',
      'no-new': 'off',
      'new-cap': 'off',
      complexity: 'off',
      'max-depth': 'off',
      'promise/prefer-await-to-then': 'off',
      'import/extensions': 'off',
      'n/file-extension-in-import': 'off',
      'n/prefer-global/buffer': 'off',

      // Prettier integration
      'prettier/prettier': 'error',

      // Disable conflicting rules
      ...prettierConfig.rules,
    },
  },
  {
    files: ['vite.config.ts', 'vite-plugins/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.node.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.node.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'prettier/prettier': 'error',
      ...prettierConfig.rules,
    },
  },
);