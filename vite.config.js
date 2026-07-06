import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    strictPort: true,
    proxy: {
      '/api':  { target: 'http://localhost:3001', changeOrigin: true, timeout: 600000, proxyTimeout: 600000 },
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
