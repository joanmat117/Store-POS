import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Base ignores
  {
    ignores: [
      'dist/**',
      'release/**',
      'node_modules/**',
      '*.sqlite',
      '*.deb',
      '*.exe',
      'electron/main.js',
      'electron/preload.cjs',
      'server/standalone.js',
      'server/**/*.ts',
      'server/dev-server.ts',
      'scripts/**',
      'build/**',
      'public/**',
      '.github/**',
      '*.config.js',
      '*.config.ts',
      'vite.config.ts',
      'eslint.config.js',
      'prettier.config.js',
      'server/dist/**',
    ],
  },

  // JavaScript/TypeScript base
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // Node.js / CommonJS server files
  {
    ignores: ['dist/**', 'release/**'],
    files: ['server/**/*.js', 'server/**/*.mjs', 'server/**/*.cjs'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
exports: 'readonly',
        global: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-redeclare': ['error', { builtinGlobals: false }],
    },
  },

  // React recommended (TypeScript/TSX files)
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: '18.3',
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Prettier config last to override conflicts
  prettierConfig
);