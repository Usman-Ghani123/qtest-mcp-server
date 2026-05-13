import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as clientModule from '../../../src/client.js'

vi.mock('../../../src/client.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../../src/client.js')>()
  return {
    ...original,
    qtestFetch: vi.fn(),
  }
})

const mockQtestFetch = vi.mocked(clientModule.qtestFetch)

import { getModules } from '../../../src/tools/test-design/list_test_design_modules.js'

describe('getModules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses search endpoint when query is provided', async () => {
    mockQtestFetch.mockResolvedValue({ items: [] })
    await getModules({ projectId: '1', query: 'Smoke Tests' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/modules?search=Smoke%20Tests&size=50',
      'GET'
    )
  })

  it('uses parentId endpoint when parentId is provided', async () => {
    mockQtestFetch.mockResolvedValue([])
    await getModules({ projectId: '1', parentId: 42 })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/modules?parentId=42&size=100',
      'GET'
    )
  })

  it('uses plain listing endpoint when neither query nor parentId provided', async () => {
    mockQtestFetch.mockResolvedValue([])
    await getModules({ projectId: '1' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/modules?size=100',
      'GET'
    )
  })

  it('applies extractArray to response with items wrapper', async () => {
    mockQtestFetch.mockResolvedValue({ items: [{ id: 5, name: 'Module A' }] })
    const result = await getModules({ projectId: '1' })
    expect(result).toEqual([{ id: 5, name: 'Module A' }])
  })

  it('applies extractArray to raw array response', async () => {
    mockQtestFetch.mockResolvedValue([{ id: 7, name: 'Module B' }])
    const result = await getModules({ projectId: '1' })
    expect(result).toEqual([{ id: 7, name: 'Module B' }])
  })
})
