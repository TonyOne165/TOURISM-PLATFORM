import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000101',
        'brand-dark': '#0C2E3D',
        'brand-blue': '#186784',
        'brand-brown': '#9A7C65',
        'brand-beige': '#C0A088',
        'brand-cream': '#DAC6B6',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    themes: [
      {
        tourism: {
          "primary": "#186784",
          "primary-focus": "#0C2E3D",
          "primary-content": "#ffffff",
          "secondary": "#9A7C65",
          "secondary-focus": "#856A53",
          "secondary-content": "#ffffff",
          "accent": "#C0A088",
          "accent-focus": "#9A7C65",
          "accent-content": "#0C2E3D",
          "neutral": "#0C2E3D",
          "neutral-focus": "#000101",
          "neutral-content": "#DAC6B6",
          "base-100": "#DAC6B6",
          "base-200": "#C0A088",
          "base-300": "#9A7C65",
          "base-content": "#0C2E3D",
          "info": "#186784",
          "success": "#22c55e",
          "warning": "#eab308",
          "error": "#ef4444",
        },
      },
    ],
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}

export default config
