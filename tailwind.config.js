/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors based on mockup
        primary: {
          50: '#f5f3f0',
          100: '#e8e4dd',
          200: '#d4cbbe',
          300: '#baab98',
          400: '#a08e78',
          500: '#8a7562',
          600: '#6f5d4d',
          700: '#5a4a3d',
          800: '#4a3f35',
          900: '#3f362f',
        },
        accent: {
          50: '#fef4ee',
          100: '#fde6d7',
          200: '#fac9ae',
          300: '#f7a47a',
          400: '#f37444',
          500: '#f05024', // Main orange from button
          600: '#e1361a',
          700: '#bb2616',
          800: '#952119',
          900: '#791f18',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53', // Main navy from text
          900: '#102a43',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        techno: ['Orbitron', 'monospace'],
      },
    },
  },
  plugins: [],
}
