import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    env: {
      QTEST_BASE_URL: 'https://test.example.qtestnet.com',
      QTEST_TOKEN: 'test-token-for-vitest',
    },
  },
})
