/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Bugatti tokens — flip per `<html.dark>` / `<html.light-mode>` via
        // CSS custom properties defined in globals.css.
        // ink/canvas use rgb() syntax so Tailwind opacity modifiers
        // (bg-ink/5, text-ink/80) work; hairline uses intrinsic alpha.
        canvas: 'rgb(var(--bugatti-canvas) / <alpha-value>)',
        ink: 'rgb(var(--bugatti-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--bugatti-ink-muted) / <alpha-value>)',
        hairline: 'var(--bugatti-hairline)',
        'hairline-soft': 'var(--bugatti-hairline-soft)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-bugatti-display)', 'Unbounded', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-bugatti-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('daisyui')],
}