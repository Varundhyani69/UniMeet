import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://unimeet-i1j9.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  plugins: [react(), tailwindcss()]
})

