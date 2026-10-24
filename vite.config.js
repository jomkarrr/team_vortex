import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://jomkarrr.github.io/team_vortex/
// Production builds must be served under /team_vortex/, not the domain root.
// Dev server keeps '/' so `npm run dev` still opens at the root.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/team_vortex/' : '/',
}))
