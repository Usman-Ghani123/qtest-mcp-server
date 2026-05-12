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

import { createExecutionFolder } from '../../../src/tools/test-execution/createExecutionFolder.js'

describe('createExecutionFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses parentType=test-cycle when parentId is provided', async () => {
    mockQtestFetch.mockResolvedValue({ id: 55, name: 'Sprint 1', parentId: 20 })
    await createExecutionFolder({ projectId: '1', name: 'Sprint 1', parentId: 20 })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/test-cycles?parentId=20&parentType=test-cycle',
      'POST',
      expect.objectContaining({ name: 'Sprint 1' })
    )
  })

  it('uses parentType=root when no parentId provided', async () => {
    mockQtestFetch.mockResolvedValue({ id: 10, name: 'Root Folder' })
    await createExecutionFolder({ projectId: '1', name: 'Root Folder' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      '/test-cycles?parentType=root',
      'POST',
      expect.any(Object)
    )
  })

  it('always includes description: "" in body', async () => {
    mockQtestFetch.mockResolvedValue({ id: 10, name: 'Folder' })
    await createExecutionFolder({ projectId: '1', name: 'Folder' })
    expect(mockQtestFetch).toHaveBeenCalledWith(
      expect.anything(),
      '1',
      expect.any(String),
      'POST',
      expect.objectContaining({ description: '' })
    )
  })
})
