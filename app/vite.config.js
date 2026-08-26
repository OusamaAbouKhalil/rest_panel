import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Relative base so the same build works at ousamaaboukhalil.github.io/rest_panel/
  // AND at restaurants.swiftgo.online root (HashRouter keeps the document URL at the mount root)
  base: './',
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
