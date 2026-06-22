/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/src/**/*.{js,jsx,ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        // MTAP brand — mirrors the appraisal letter footer bar
        brand: {
          blue:   '#1E88E5',
          green:  '#43A047',
          orange: '#FB8C00',
          red:    '#E53935',
        },
        // Shell
        shell: {
          bg:       '#0b1d3a',
          sidebar:  '#071426',
          border:   'rgba(255,255,255,0.07)',
          text:     '#eef4ff',
          muted:    '#6b85a8',
        },
        // Canvas (document area)
        canvas: {
          bg:     '#e8ecf2',
          paper:  '#ffffff',
        },
        // Semantic (using brand colours)
        active:   '#1E88E5',
        success:  '#43A047',
        warning:  '#FB8C00',
        danger:   '#E53935',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        letter: ['Calibri', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 4px 24px rgba(0,0,0,0.18)',
        panel: '0 2px 12px rgba(0,0,0,0.25)',
      }
    }
  },
  plugins: []
}
