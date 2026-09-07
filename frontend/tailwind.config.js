/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Primary
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          amber: '#f59e0b',
          orange: '#f97316',
          yellow: '#fbbf24',
          light: '#fef3c7',
        },
        surface: {
          light: '#fbfbfa',
          card: '#ffffff',
          muted: '#f8fafc',
          border: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'lifted': '0 12px 28px -4px rgba(0, 0, 0, 0.08), 0 8px 10px -4px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
