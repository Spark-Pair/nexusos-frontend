import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@app': path.resolve(import.meta.dirname, 'src/app'),
      '@domain': path.resolve(import.meta.dirname, 'src/domain'),
      '@infrastructure': path.resolve(import.meta.dirname, 'src/infrastructure'),
      '@shared': path.resolve(import.meta.dirname, 'src/shared')
    }
  },
  test: {
    environment: 'jsdom',
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true
  }
})
