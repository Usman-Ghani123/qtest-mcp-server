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

import { addTestCases } from '../../../src/tools/test-execution/add_cases_to_execution_suite.js'

const testCases = [
  { id: 101, name: 'Login Test' },
  { id: 102, name: 'Logout Test' },
]

describe('addTestCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes one POST per test case', async () => {
    mockQtestFetch.mockResolvedValue({ id: 1 })
    await addTestCases({ projectId: '1', suiteId: 50, testCases })
    expect(mockQtestFetch).toHaveBeenCalledTimes(2)
  })

  it('posts to the test-runs endpoint with correct parentId', async () => {
    mockQtestFetch.mockResolvedValue({ id: 1 })
    await addTestCases({ projectId: '1', suiteId: 50, testCases })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/test-runs?parentId=50&parentType=test-suite',
      'POST',
      expect.any(Object)
    )
  })

  it('sends test_case: { id } in body — not a flat testCaseId field', async () => {
    mockQtestFetch.mockResolvedValue({ id: 1 })
    await addTestCases({ projectId: '1', suiteId: 50, testCases: [{ id: 101, name: 'Login' }] })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      expect.any(String),
      'POST',
      expect.objectContaining({ test_case: { id: 101 } })
    )
  })

  it('returns correct added count on full success', async () => {
    mockQtestFetch.mockResolvedValue({ id: 1 })
    const result = await addTestCases({ projectId: '1', suiteId: 50, testCases })
    expect(result).toEqual({ added: 2 })
  })

  it('continues and counts partial success when one call fails', async () => {
    mockQtestFetch
      .mockResolvedValueOnce({ id: 1 })
      .mockRejectedValueOnce(new Error('HTTP 500: Server Error'))
    const result = await addTestCases({ projectId: '1', suiteId: 50, testCases })
    expect(result).toEqual({ added: 1 })
  })
})
