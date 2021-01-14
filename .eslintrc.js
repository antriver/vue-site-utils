module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: [
        '@antriver/eslint-config-antriver',
        '@antriver/eslint-config-antriver/vue',
        '@antriver/eslint-config-antriver/typescript',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
    ],
    rules: {
        '@typescript-eslint/ban-types': 'off',
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
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
};
