/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        header:  '#0F1F1C',
        accent:  '#00C896',
        'accent-dim': '#00A87E',
        bg:      '#F0F2F1',
        surface: '#FFFFFF',
        ink:     '#1A2421',
        muted:   '#637068',
      },
      fontFamily: {
        ui:   ['DM Sans', 'system-ui', 'sans-serif'],
        data: ['DM Mono', 'Courier New', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '18px',
        xl: '24px',
        '2xl': '24px',
        full: '9999px',
      },
      borderWidth: {
        thin: '0.5px',
      },
    },
  },
  plugins: [],
}
