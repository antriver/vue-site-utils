module.exports = {
    root: true,
    env: {
        browser: true,
        node: true
    },
    extends: [
        '@digitickets/eslint-config-digitickets',
        '@digitickets/eslint-config-digitickets/vue',
        'plugin:@typescript-eslint/recommended'
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
        ]
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
    ]
    // check if imports actually resolve
    /*'settings': {
        'import/resolver': {
            'webpack': {
                // See https://cli.vuejs.org/guide/webpack.html#using-resolved-config-as-a-file
                'config': './node_modules/@vue/cli-service/webpack.config.js'
            }
        }
    }*/
};