import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the app from /ongo-prototype/
  base: command === 'build' ? '/ongo-prototype/' : '/',
  plugins: [react(), tailwindcss()],
  server: { host: true },
}))
