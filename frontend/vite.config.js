import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {},
  },
})
