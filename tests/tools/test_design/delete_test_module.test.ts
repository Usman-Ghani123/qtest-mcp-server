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

import { deleteTestModule } from '@/tools/test_design/delete_test_module.js'

describe('deleteTestModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GETs the module first then DELETEs it', async () => {
    const mod = { id: 20, name: 'Login Tests' }
    mockQtestFetch.mockResolvedValueOnce(mod).mockResolvedValueOnce(mod)
    await deleteTestModule({ projectId: '1', id: 20 })
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      1, expect.anything(), '1', '/modules/20', 'GET'
    )
    expect(mockQtestFetch).toHaveBeenNthCalledWith(
      2, expect.anything(), '1', '/modules/20', 'DELETE'
    )
  })

  it('returns deleted: true and the module info', async () => {
    const mod = { id: 20, name: 'Login Tests' }
    mockQtestFetch.mockResolvedValue(mod)
    const result = await deleteTestModule({ projectId: '1', id: 20 })
    expect(result).toEqual({ deleted: true, module: mod })
  })

  it('throws when the GET fails (module not found)', async () => {
    mockQtestFetch.mockRejectedValueOnce(new Error('HTTP 404: Not Found'))
    await expect(
      deleteTestModule({ projectId: '1', id: 999 })
    ).rejects.toThrow('HTTP 404: Not Found')
  })
})
