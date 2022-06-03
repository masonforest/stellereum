import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactSvgPlugin from 'vite-plugin-react-svg'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ['es2020'],
  },
  plugins: [
    react(),
    reactRefresh(),
    reactSvgPlugin(),
  ]
})
