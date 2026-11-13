/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: {
          light: '#FAFAFA',
          dark: '#121212',
          surface: '#FFFFFF',
          'surface-dark': '#1E1E1E',
          subtle: '#F4F5F6',
          'subtle-dark': '#262626',
        },
        ink: {
          light: '#212121',
          dark: '#E5E5E5',
          muted: '#64748B',
          'muted-dark': '#94A3B8',
        },
        teal: {
          DEFAULT: '#006D77',
          hover: '#005860',
          light: '#E6F4F5',
          dark: '#83C5BE',
        },
        slate: {
          DEFAULT: '#64748B',
          hover: '#475569',
          light: '#F1F5F9',
        },
        success: {
          DEFAULT: '#2A9D8F',
          light: '#E8F6F4',
        },
        danger: {
          DEFAULT: '#E63946',
          light: '#FDECEE',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
};
