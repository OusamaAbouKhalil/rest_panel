import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: [
            'firebase/app', 'firebase/auth', 'firebase/firestore',
            'firebase/database', 'firebase/storage', 'firebase/functions',
          ],
          charts: ['recharts'],
        },
      },
    },
  },
})
