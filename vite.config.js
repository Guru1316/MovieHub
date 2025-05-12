import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/MovieHub/', // ✅ This is essential for GitHub Pages
  plugins: [react()],
})
