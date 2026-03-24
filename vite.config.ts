/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function createProxyRule(target: string) {
  return {
    target,
    changeOrigin: true,
    secure: false,
  }
}

const configuredProxyTarget =
  process.env.VITE_DEV_API_BASE_URL?.trim() ||
  process.env.VITE_AIP_SERVER_BASE_URL?.trim() ||
  ''

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  server: configuredProxyTarget
    ? {
        proxy: {
          '/api': createProxyRule(configuredProxyTarget),
          '/auth': createProxyRule(configuredProxyTarget),
          '/legal': createProxyRule(configuredProxyTarget),
          '/admin': createProxyRule(configuredProxyTarget),
        },
      }
    : undefined,
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
