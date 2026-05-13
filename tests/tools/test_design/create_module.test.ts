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

import { createModule } from '@/tools/test_design/create_module.js'

describe('createModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses parentType=module and includes parentId when parentId provided', async () => {
    mockQtestFetch.mockResolvedValue({ id: 99, name: 'Child', parentId: 10 })
    await createModule({ projectId: '1', name: 'Child', parentId: 10 })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/modules?parentId=10&parentType=module',
      'POST',
      { name: 'Child' }
    )
  })

  it('uses parentType=root when no parentId provided', async () => {
    mockQtestFetch.mockResolvedValue({ id: 1, name: 'Root Module' })
    await createModule({ projectId: '1', name: 'Root Module' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/modules?parentType=root',
      'POST',
      { name: 'Root Module' }
    )
  })
})

describe('createModule — parentPid path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves parentPid O(1) — no extra API call', async () => {
    mockQtestFetch.mockResolvedValue({ id: 99, name: 'Sub' })
    await createModule({ projectId: '1', name: 'Sub', parentPid: 'MD-448' })
    expect(mockQtestFetch).toHaveBeenCalledTimes(1)
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(), '1',
      '/modules?parentId=448&parentType=module', 'POST', { name: 'Sub' }
    )
  })

  it('throws on malformed parentPid before any API call', async () => {
    await expect(
      createModule({ projectId: '1', name: 'Sub', parentPid: 'MD-abc' })
    ).rejects.toThrow('Invalid pid format')
    expect(mockQtestFetch).not.toHaveBeenCalled()
  })
})
