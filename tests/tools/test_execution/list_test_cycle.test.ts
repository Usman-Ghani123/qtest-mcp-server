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
    mockQtestFetch
      .mockResolvedValueOnce({ id: 10, name: 'Sprint 1' }) // GET /test-cycles/10
      .mockResolvedValueOnce([])                            // GET children → []
    await listTestCycles({ projectId: '1', id: 10 })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-cycles/10', 'GET'
    )
  })

  it('returns single object when id is provided', async () => {
    const cycle = { id: 10, name: 'Sprint 1' }
    mockQtestFetch
      .mockResolvedValueOnce(cycle)
      .mockResolvedValueOnce([]) // GET children → []
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

  it('filters by pid when pid is provided', async () => {
    const cycles = [
      { id: 1, name: 'Sprint 1', pid: 'CL-100' },
      { id: 2, name: 'Sprint 2', pid: 'CL-200' },
    ]
    mockQtestFetch
      .mockResolvedValueOnce(cycles) // GET /test-cycles
      .mockResolvedValueOnce([])     // GET children of cycle 2 → []
    const result = await listTestCycles({ projectId: '1', pid: 'CL-200' })
    expect(result).toEqual([{ id: 2, name: 'Sprint 2', pid: 'CL-200' }])
  })

  it('returns empty array when pid filter matches nothing', async () => {
    mockQtestFetch.mockResolvedValue([{ id: 1, name: 'Sprint 1', pid: 'CL-100' }])
    const result = await listTestCycles({ projectId: '1', pid: 'CL-999' })
    expect(result).toEqual([])
  })

  it('embeds children tree when cycle has nested children (id lookup)', async () => {
    const parent = { id: 10, name: 'Sprint 1' }
    const child = { id: 11, name: 'Child Cycle' }
    mockQtestFetch
      .mockResolvedValueOnce(parent)  // GET /test-cycles/10
      .mockResolvedValueOnce([child]) // GET children of 10 → [child]
      .mockResolvedValueOnce([])      // GET children of 11 → []
    const result = await listTestCycles({ projectId: '1', id: 10 })
    expect(result).toEqual({ ...parent, children: [child] })
  })

  it('embeds children tree for pid-matched cycle', async () => {
    const cycle = { id: 10, name: 'Sprint 1', pid: 'CL-100' }
    const child = { id: 11, name: 'Child Cycle' }
    mockQtestFetch
      .mockResolvedValueOnce([cycle]) // GET /test-cycles
      .mockResolvedValueOnce([child]) // GET children of 10 → [child]
      .mockResolvedValueOnce([])      // GET children of 11 → []
    const result = await listTestCycles({ projectId: '1', pid: 'CL-100' })
    expect(result).toEqual([{ ...cycle, children: [child] }])
  })

  it('omits children property when cycle has no children', async () => {
    const cycle = { id: 10, name: 'Sprint 1' }
    mockQtestFetch
      .mockResolvedValueOnce(cycle)
      .mockResolvedValueOnce([])
    const result = await listTestCycles({ projectId: '1', id: 10 })
    expect((result as any).children).toBeUndefined()
  })
})
