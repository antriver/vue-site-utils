module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    extends: [
        '@antriver/eslint-config-antriver',
        '@antriver/eslint-config-antriver/vue',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser'
    },
    rules: {
        'vue/script-indent': [
            'error',
            4,
            {
                baseIndent: 0,
                switchCase: 1
            }
        ],
        '@typescript-eslint/no-explicit-any': [
            'off'
        ],

        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',

        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/explicit-function-return-type": ["error"]
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ],
            env: {
                jest: true
            }
        }
    ],
    settings: {
        'import/resolver': {
            typescript: {}
        }
    },
};
