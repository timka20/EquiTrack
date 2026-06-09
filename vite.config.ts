import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 27435,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:49375',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:49375',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 27435,
    host: true,
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
