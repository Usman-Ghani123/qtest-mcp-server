export interface QTestConfig {
  baseUrl: string
  token: string
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Set ${name} before starting qtest-mcp-server.`
    )
  }
  return value
}

export const config: QTestConfig = {
  baseUrl: requireEnv('QTEST_BASE_URL').replace(/\/$/, ''),
  token: requireEnv('QTEST_TOKEN'),
}
