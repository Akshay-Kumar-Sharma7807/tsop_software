/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Priority status colors — used ONLY for red/amber/green status
        priority: {
          red: {
            DEFAULT: '#ef4444',
            light: '#fef2f2',
            border: '#fca5a5',
          },
          amber: {
            DEFAULT: '#f59e0b',
            light: '#fffbeb',
            border: '#fcd34d',
          },
          green: {
            DEFAULT: '#22c55e',
            light: '#f0fdf4',
            border: '#86efac',
          },
        },
        // Neutral palette for all UI chrome
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
