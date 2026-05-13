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

import { deleteModule } from '@/tools/test_design/delete_module.js'

describe('deleteModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GETs the module info, checks for children and test cases, then DELETEs it', async () => {
    const mod = { id: 20, name: 'Login Tests' }
    mockQtestFetch
      .mockResolvedValueOnce(mod)  // GET /modules/20
      .mockResolvedValueOnce([])   // GET /modules?parentId=20 → no children
      .mockResolvedValueOnce([])   // GET /test-cases?parentId=20... → no cases
      .mockResolvedValueOnce(null) // DELETE /modules/20

    await deleteModule({ projectId: '1', id: 20 })

    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      1, expect.anything(), '1', '/modules/20', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      2, expect.anything(), '1', '/modules?parentId=20&size=100', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      3, expect.anything(), '1', '/test-cases?parentId=20&parentType=module&page=1&size=100', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      4, expect.anything(), '1', '/modules/20', 'DELETE'
    )
  })

  it('returns deleted: true and the module info', async () => {
    const mod = { id: 20, name: 'Login Tests' }
    mockQtestFetch
      .mockResolvedValueOnce(mod)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(null)

    const result = await deleteModule({ projectId: '1', id: 20 })
    expect(result).toEqual({ deleted: true, module: mod })
  })

  it('throws when the GET fails (module not found)', async () => {
    mockQtestFetch.mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
    await expect(
      deleteModule({ projectId: '1', id: 999 })
    ).rejects.toThrow('HTTP 404: Not Found')
  })

  it('deletes test cases before deleting the module', async () => {
    const mod = { id: 20, name: 'Login Tests' }
    const tc1 = { id: 101, name: 'TC 1', properties: [] }
    const tc2 = { id: 102, name: 'TC 2', properties: [] }
    mockQtestFetch
      .mockResolvedValueOnce(mod)        // GET /modules/20
      .mockResolvedValueOnce([])         // GET children → []
      .mockResolvedValueOnce([tc1, tc2]) // GET test-cases page 1 → [tc1, tc2]
      .mockResolvedValueOnce(null)       // DELETE /test-cases/101
      .mockResolvedValueOnce(null)       // DELETE /test-cases/102
      // cases.length=2 < 100 → loop breaks, no page-2 fetch
      .mockResolvedValueOnce(null)       // DELETE /modules/20

    await deleteModule({ projectId: '1', id: 20 })

    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-cases/101', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/test-cases/102', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenLastCalledWith(
      expect.anything(), '1', '/modules/20', 'DELETE'
    )
  })

  it('recursively deletes child modules (deepest first) before the parent', async () => {
    const parent = { id: 10, name: 'Parent Module' }
    const child = { id: 11, name: 'Child Module' }
    mockQtestFetch
      .mockResolvedValueOnce(parent)  // GET /modules/10
      .mockResolvedValueOnce([child]) // GET children of 10 → [child]
      .mockResolvedValueOnce([])      // GET children of 11 → []
      .mockResolvedValueOnce([])      // GET test-cases of 11 → []
      .mockResolvedValueOnce(null)    // DELETE /modules/11
      .mockResolvedValueOnce([])      // GET test-cases of 10 → []
      .mockResolvedValueOnce(null)    // DELETE /modules/10

    const result = await deleteModule({ projectId: '1', id: 10 })
    expect(result).toEqual({ deleted: true, module: parent })

    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1', '/modules/11', 'DELETE'
    )
    expect(mockQtestFetch).toHaveBeenLastCalledWith(
      expect.anything(), '1', '/modules/10', 'DELETE'
    )
  })
})
