const { nextui } = require('@nextui-org/react');
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '.3rem',
        sm: '0',
        lg: '0',
        xl: '1rem',
        '2xl': '1rem',
      },
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: '#000000', 
        'neutral-black': '#333333', 
        'neutral-white': '#f4f4f4', 
      },
      backgroundColor: {
        'bg-neutral-dark-md': '#f0f0f0', 
        'main-dark': '#dcdcdc', 
        'main-light': '#ffffff', 
      },
    },
    screens: {
      xs: '450px',
      sm: '576px',
      md: '768px', // Tablet
      lg: '992px',
      xl: '1200px', // PC
      '2xl': '1400px',
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      addCommonColors: true,
    }),
  ],
};

export default config;
