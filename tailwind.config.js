import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const petpalsPreset = require('./shared-web-theme/tailwind.preset.cjs')

/** @type {import('tailwindcss').Config} */
export default {
  presets: [petpalsPreset],
  content: ['./index.html', './src/**/*.{js,jsx}'],
}
