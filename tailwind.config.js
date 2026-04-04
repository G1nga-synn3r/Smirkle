/** @type {import('tailwindcss').Config} */
export default {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [import("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'electric-midnight': {
          background: '#0a0a0a',
          surface: '#0d0d0d',
          'neon-cyan': '#00ffea',
          'neon-yellow': '#ffff00',
          'neon-magenta': '#ff00ff',
          'error-red': '#ff3333',
          'warning-red': '#ff0000',
          white: '#ffffff',
          gray: '#555555',
          'gray-dark': '#333333',
        },
        // Flattened colors for easier nativewind usage
        'midnight-bg': '#0a0a0a',
        'midnight-surface': '#0d0d0d',
        'neon-cyan': '#00ffea',
        'neon-yellow': '#ffff00',
        'neon-magenta': '#ff00ff',
        'error-red': '#ff3333',
        'warning-red': '#ff0000',
        'midnight-white': '#ffffff',
        'midnight-gray': '#555555',
        'midnight-gray-dark': '#333333',
      }
    },
  },
  plugins: [],
}