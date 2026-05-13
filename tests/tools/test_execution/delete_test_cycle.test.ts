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

import { deleteTestCycle } from '@/tools/test_execution/delete_test_cycle.js'

describe('deleteTestCycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GETs the cycle info, checks for suites and sub-cycles, then DELETEs it', async () => {
    const cycle = { id: 42, name: 'Sprint 3' }
    mockQtestFetch
      .mockResolvedValueOnce(cycle) // GET /test-cycles/42
      .mockResolvedValueOnce([])    // GET /test-suites?parentId=42&parentType=test-cycle → []
      .mockResolvedValueOnce([])    // GET /test-cycles?parentId=42&parentType=test-cycle → []
      .mockResolvedValueOnce(null)  // DELETE /test-cycles/42

    await deleteTestCycle({ projectId: '1', id: 42 })

    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      1, expect.anything(), '1', '/test-cycles/42', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      2, expect.anything(), '1', '/test-suites?parentId=42&parentType=test-cycle', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      3, expect.anything(), '1', '/test-cycles?parentId=42&parentType=test-cycle', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      4, expect.anything(), '1', '/test-cycles/42', 'DELETE'
    )
  })

  it('returns deleted: true and the cycle info', async () => {
    const cycle = { id: 42, name: 'Sprint 3' }
    mockQtestFetch
      .mockResolvedValueOnce(cycle) // GET info
      .mockResolvedValueOnce([])    // GET suites
      .mockResolvedValueOnce([])    // GET sub-cycles
      .mockResolvedValueOnce(null)  // DELETE

    const result = await deleteTestCycle({ projectId: '1', id: 42 })
    expect(result).toEqual({ deleted: true, cycle })
  })

  it('throws when the GET fails (cycle not found)', async () => {
    mockQtestFetch.mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
    await expect(
      deleteTestCycle({ projectId: '1', id: 999 })
    ).rejects.toThrow('HTTP 404: Not Found')
  })

  it('deletes test suites and their runs before deleting the cycle', async () => {
    const cycle = { id: 42, name: 'Sprint 3' }
    const suite = { id: 5, name: 'Suite A' }
    const run = { id: 100, name: 'Run 1' }
    mockQtestFetch
      .mockResolvedValueOnce(cycle)   // GET /test-cycles/42
      .mockResolvedValueOnce([suite]) // GET suites of 42 → [suite]
      .mockResolvedValueOnce([run])   // GET runs of suite 5 → [run]
      .mockResolvedValueOnce(null)    // DELETE /test-runs/100
      .mockResolvedValueOnce(null)    // DELETE /test-suites/5
      .mockResolvedValueOnce([])      // GET sub-cycles of 42 → []
      .mockResolvedValueOnce(null)    // DELETE /test-cycles/42

    const result = await deleteTestCycle({ projectId: '1', id: 42 })
    expect(result).toEqual({ deleted: true, cycle })

    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-runs/100', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-suites/5', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenLastCalledWith(
      expect.anything(), '1', '/test-cycles/42', 'DELETE'
    )
  })

  it('recursively deletes child cycles (deepest first) before the parent', async () => {
    const parent = { id: 10, name: 'Parent' }
    const child = { id: 11, name: 'Child' }
    mockQtestFetch
      .mockResolvedValueOnce(parent)  // GET /test-cycles/10
      .mockResolvedValueOnce([])      // GET suites of 10 → []
      .mockResolvedValueOnce([child]) // GET sub-cycles of 10 → [child]
      .mockResolvedValueOnce([])      // GET suites of 11 → []
      .mockResolvedValueOnce([])      // GET sub-cycles of 11 → []
      .mockResolvedValueOnce(null)    // DELETE /test-cycles/11
      .mockResolvedValueOnce(null)    // DELETE /test-cycles/10

    const result = await deleteTestCycle({ projectId: '1', id: 10 })
    expect(result).toEqual({ deleted: true, cycle: parent })

    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      6, expect.anything(), '1', '/test-cycles/11', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      7, expect.anything(), '1', '/test-cycles/10', 'DELETE'
    )
  })
})
