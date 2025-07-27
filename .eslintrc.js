module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: [
        '@antriver/eslint-config-antriver/typescript',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
    ],
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
    rules: {
        '@typescript-eslint/ban-types': 'off',

        '@typescript-eslint/type-annotation-spacing': 'off',
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
