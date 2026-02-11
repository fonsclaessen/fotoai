/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                neu: {
                    base: '#e0e5ec',
                    light: '#ffffff',
                    dark: '#a3b1c6',
                    'base-dk': '#2d3748',
                    'light-dk': '#3a4556',
                    'dark-dk': '#1a202c',
                },
            },
            boxShadow: {
                'neu': '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
                'neu-sm': '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
                'neu-lg': '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
                'neu-inset': 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
                'neu-inset-sm': 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff',
                'neu-dark': '6px 6px 12px #1a202c, -6px -6px 12px #3a4556',
                'neu-dark-sm': '3px 3px 6px #1a202c, -3px -3px 6px #3a4556',
                'neu-dark-lg': '10px 10px 20px #1a202c, -10px -10px 20px #3a4556',
                'neu-dark-inset': 'inset 4px 4px 8px #1a202c, inset -4px -4px 8px #3a4556',
                'neu-dark-inset-sm': 'inset 2px 2px 4px #1a202c, inset -2px -2px 4px #3a4556',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
