import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as clientModule from '@/client.js'

vi.mock('@/client.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/client.js')>()
  return {
    ...original,
    qtestFetch: vi.fn(),
  }
})

const mockQtestFetch = vi.mocked(clientModule.qtestFetch)

import { listTestCycles } from '@/tools/test_execution/list_test_cycle.js'

describe('listTestCycles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches /test-cycles/{id} when id is provided', async () => {
    mockQtestFetch.mockResolvedValue({ id: 10, name: 'Sprint 1' })
    await listTestCycles({ projectId: '1', id: 10 })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-cycles/10', 'GET'
    )
  })

  it('returns single object when id is provided', async () => {
    const cycle = { id: 10, name: 'Sprint 1' }
    mockQtestFetch.mockResolvedValue(cycle)
    const result = await listTestCycles({ projectId: '1', id: 10 })
    expect(result).toEqual(cycle)
  })

  it('fetches /test-cycles when no args provided', async () => {
    mockQtestFetch.mockResolvedValue([])
    await listTestCycles({ projectId: '1' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-cycles', 'GET'
    )
  })

  it('returns all cycles when no name filter provided', async () => {
    const cycles = [{ id: 1, name: 'Sprint 1' }, { id: 2, name: 'Sprint 2' }]
    mockQtestFetch.mockResolvedValue(cycles)
    const result = await listTestCycles({ projectId: '1' })
    expect(result).toEqual(cycles)
  })

  it('filters by name case-insensitively when name is provided', async () => {
    const cycles = [{ id: 1, name: 'Sprint 1' }, { id: 2, name: 'Regression' }]
    mockQtestFetch.mockResolvedValue(cycles)
    const result = await listTestCycles({ projectId: '1', name: 'sprint 1' })
    expect(result).toEqual([{ id: 1, name: 'Sprint 1' }])
  })

  it('returns empty array when name filter matches nothing', async () => {
    mockQtestFetch.mockResolvedValue([{ id: 1, name: 'Sprint 1' }])
    const result = await listTestCycles({ projectId: '1', name: 'Nonexistent' })
    expect(result).toEqual([])
  })

  it('applies extractArray to items-wrapped response', async () => {
    mockQtestFetch.mockResolvedValue({ items: [{ id: 5, name: 'Release' }] })
    const result = await listTestCycles({ projectId: '1' })
    expect(result).toEqual([{ id: 5, name: 'Release' }])
  })
})
