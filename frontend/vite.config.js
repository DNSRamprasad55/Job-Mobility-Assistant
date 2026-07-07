import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
      '/jobs': 'http://localhost:8000',
      '/applications': 'http://localhost:8000',
      '/ai': 'http://localhost:8000',
    },
  },
})
