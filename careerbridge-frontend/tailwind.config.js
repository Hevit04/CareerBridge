/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'cursive'],
        'syne': ['Syne', 'sans-serif'],
        'mono': ['"DM Mono"', 'monospace'],
      },
      colors: {
        primary:   '#00f5d4',
        violet:    '#7b2fff',
        acid:      '#d4ff00',
        danger:    '#ff4d6d',
        bg:        '#07070f',
        s1:        '#0e0e1c',
        s2:        '#141428',
        s3:        '#1c1c35',
        t1:        '#f2f2ff',
        t2:        '#c8c8e8',
        t3:        '#9090b8',
        t4:        '#5a5a80',
      },
      animation: {
        'float1': 'float1 5s ease-in-out infinite',
        'float2': 'float2 6s ease-in-out 1.2s infinite',
        'float3': 'float3 7s ease-in-out 2.1s infinite',
        'marquee': 'marquee 22s linear infinite',
        'fadeUp':  'fadeUp .7s both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        float1: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        float2: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        float3: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(22px)' }, to: { opacity: '1', transform: 'none' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.3' } },
      },
    },
  },
  plugins: [],
}
