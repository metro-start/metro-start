import js from '@eslint/js';
import globals from 'globals';
import {defineConfig} from 'eslint/config';

export default defineConfig([
    {
        ignores: ['dist/**', 'demo/**', 'node_modules/**'],
    },
    {
        files: ['es6/**/*.js'],
        plugins: {js},
        extends: ['js/recommended'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
        rules: {
            'no-console': 'off',
            'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
            'prefer-const': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-template': 'error',
            'no-implicit-coercion': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
        },
    },
    {
        files: ['scripts/**/*.{js,cjs,ts}', 'webpack.config.js', 'test/**/*.js'],
        plugins: {js},
        extends: ['js/recommended'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {...globals.node, ...globals.browser, Bun: 'readonly'},
        },
        rules: {
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
        },
    },
]);
