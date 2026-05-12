import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { qtestFetch, extractArray } from '../src/client.js'
import type { QTestConfig } from '../src/client.js'

const mockConfig: QTestConfig = {
  baseUrl: 'https://example.qtestnet.com',
  token: 'test-token-123',
}

describe('qtestFetch', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('constructs the correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })
    await qtestFetch(mockConfig, '12345', '/modules?size=100', 'GET')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.qtestnet.com/api/v3/projects/12345/modules?size=100',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('includes Bearer token in Authorization header', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await qtestFetch(mockConfig, '12345', '/modules', 'GET')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      })
    )
  })

  it('throws on 4xx with status and response text', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    })
    await expect(qtestFetch(mockConfig, '1', '/test-cases', 'GET')).rejects.toThrow(
      'HTTP 404: Not Found'
    )
  })

  it('throws on 5xx', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })
    await expect(qtestFetch(mockConfig, '1', '/modules', 'GET')).rejects.toThrow('HTTP 500')
  })

  it('sends body as JSON for POST', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) })
    await qtestFetch(mockConfig, '1', '/modules', 'POST', { name: 'My Module' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'My Module' }),
      })
    )
  })
})

describe('extractArray', () => {
  it('handles raw array', () => {
    expect(extractArray([1, 2, 3])).toEqual([1, 2, 3])
  })

  it('handles { items: [] }', () => {
    expect(extractArray({ items: ['a', 'b'] })).toEqual(['a', 'b'])
  })

  it('handles { data: [] }', () => {
    expect(extractArray({ data: [{ id: 1 }] })).toEqual([{ id: 1 }])
  })

  it('handles { object: [] }', () => {
    expect(extractArray({ object: [42] })).toEqual([42])
  })

  it('returns empty array for null', () => {
    expect(extractArray(null)).toEqual([])
  })

  it('returns empty array for unrecognized shape', () => {
    expect(extractArray({ foo: 'bar' })).toEqual([])
  })
})
