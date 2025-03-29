/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dashboard: {
          background: '#121212',
          card: 'rgba(255, 255, 255, 0.05)',
          accent: '#8884d8',
          success: 'rgb(64, 216, 132)',
          warning: 'rgb(255, 99, 132)',
          info: 'rgb(64, 156, 255)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'glass': '10px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(64, 216, 132, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(64, 216, 132, 0.4)' },
        }
      }
    },
  },
  plugins: [],
} 