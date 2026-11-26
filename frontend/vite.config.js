import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxy = {
  '/api': {
    target: process.env.API_URL || 'http://localhost:3000',
    changeOrigin: true,
    // Se o Express AINDA NÃO monta as rotas em /api, descomente:
    // rewrite: (path) => path.replace(/^\/api/, ''),
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },
  preview: { proxy },
})