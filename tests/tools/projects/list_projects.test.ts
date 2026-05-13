import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as clientModule from '@/client.js'

vi.mock('@/client.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/client.js')>()
  return {
    ...original,
    qtestFetchGlobal: vi.fn(),
  }
})

const mockQtestFetchGlobal = vi.mocked(clientModule.qtestFetchGlobal)

import { listProjects } from '@/tools/projects/list_projects.js'

describe('listProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls /projects when no projectId is provided', async () => {
    mockQtestFetchGlobal.mockResolvedValue([])
    await listProjects({})
    expect(mockQtestFetchGlobal).toHaveBeenCalledWith(
      expect.anything(),
      '/projects',
      'GET'
    )
  })

  it('calls /projects/{id} when projectId is provided', async () => {
    mockQtestFetchGlobal.mockResolvedValue({ id: 42, name: 'My Project' })
    await listProjects({ projectId: 42 })
    expect(mockQtestFetchGlobal).toHaveBeenCalledWith(
      expect.anything(),
      '/projects/42',
      'GET'
    )
  })

  it('returns single project object when projectId is provided', async () => {
    const project = { id: 42, name: 'My Project', description: 'desc' }
    mockQtestFetchGlobal.mockResolvedValue(project)
    const result = await listProjects({ projectId: 42 })
    expect(result).toEqual(project)
  })

  it('returns array from raw array response when listing all', async () => {
    const projects = [{ id: 1, name: 'Alpha' }, { id: 2, name: 'Beta' }]
    mockQtestFetchGlobal.mockResolvedValue(projects)
    const result = await listProjects({})
    expect(result).toEqual(projects)
  })

  it('returns array from items-wrapped response when listing all', async () => {
    const projects = [{ id: 3, name: 'Gamma' }]
    mockQtestFetchGlobal.mockResolvedValue({ items: projects })
    const result = await listProjects({})
    expect(result).toEqual(projects)
  })

  it('returns empty array when listing all and response is empty', async () => {
    mockQtestFetchGlobal.mockResolvedValue([])
    const result = await listProjects({})
    expect(result).toEqual([])
  })
})
