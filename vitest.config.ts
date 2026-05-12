import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      QTEST_BASE_URL: 'https://test.example.qtestnet.com',
      QTEST_TOKEN: 'test-token-for-vitest',
    },
  },
})
