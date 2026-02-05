import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                // Browser globals
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                navigator: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                requestAnimationFrame: 'readonly',
                // Performance API
                performance: 'readonly',
                PerformanceObserver: 'readonly',
                IntersectionObserver: 'readonly',
                // Form API
                FormData: 'readonly',
                // Third-party libraries
                emailjs: 'readonly',
                gtag: 'readonly',
                // Node.js (for build scripts)
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['error', { 'args': 'none' }],
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': 'error',
            'curly': 'off', // Allow single-line if statements for now
            'no-trailing-spaces': 'error',
            'indent': 'off', // Disable strict indentation for now
            'quotes': ['error', 'single'],
            'semi': ['error', 'always']
        }
    },
    {
        files: ['**/*.js'],
        ignores: ['node_modules/**', 'dist/**']
    }
];