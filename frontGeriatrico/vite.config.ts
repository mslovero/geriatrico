import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined
          if (
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
          if (id.includes('@tanstack/react-table')) return 'vendor-table'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('sweetalert2')) return 'vendor-sweetalert'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return 'vendor'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://laravel.test:80',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://laravel.test:80',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
