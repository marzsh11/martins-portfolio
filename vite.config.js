import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    async closeBundle() {
      const outputDirectory = resolve(process.cwd(), 'dist')
      await copyFile(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  base: '/',
})
