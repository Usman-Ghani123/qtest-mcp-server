import type { QTestConfig } from '@/config.js'

export type { QTestConfig }

export async function qtestFetchGlobal(
  config: QTestConfig,
  endpoint: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<unknown> {
  const url = `${config.baseUrl}/api/v3${endpoint}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  return response.json()
}

export async function qtestFetch(
  config: QTestConfig,
  projectId: string,
  endpoint: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<unknown> {
  const url = `${config.baseUrl}/api/v3/projects/${projectId}${endpoint}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }
  return response.json()
}

export function extractArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object') {
    for (const key of ['items', 'data', 'object'] as const) {
      const val = (raw as Record<string, unknown>)[key]
      if (Array.isArray(val)) return val as T[]
    }
  }
  return []
}
