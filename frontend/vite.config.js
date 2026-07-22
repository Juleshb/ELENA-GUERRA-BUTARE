import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Production backend (change to http://localhost:5001 for local API)
const BACKEND = 'https://cselenaguerra.site'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/uploads': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
