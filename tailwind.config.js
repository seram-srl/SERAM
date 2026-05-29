/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        tech: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        seram: {
          green: '#009E28',
          leaf: '#00E03C',
          dark: '#007F1A',
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out forwards',
        slideLeft: 'slideLeft 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
