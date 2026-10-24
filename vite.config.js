import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploy target: Vercel (root domain, e.g. team-vortex.vercel.app).
// Vercel serves the site from '/', so the base MUST be '/'.
// (An earlier GitHub Pages setup used '/team_vortex/' — that breaks Vercel
// with a blank page because assets would 404. Do not restore it for Vercel.)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
