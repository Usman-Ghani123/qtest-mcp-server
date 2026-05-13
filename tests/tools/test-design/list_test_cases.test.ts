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

import { getTestCases } from '../../../src/tools/test-design/list_test_cases.js'

const makeTC = (id: number, typeValue: string) => ({
  id,
  name: `TC-${id}`,
  properties: [{ field_name: 'Type', field_value_name: typeValue }],
})

describe('getTestCases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stops pagination when batch < 100', async () => {
    mockQtestFetch.mockResolvedValueOnce(
      Array.from({ length: 50 }, (_, i) => makeTC(i, 'Manual'))
    )
    const result = await getTestCases({ projectId: '1', moduleId: 10 })
    expect(mockQtestFetch).toHaveBeenCalledTimes(1)
    expect(result).toHaveLength(50)
  })

  it('fetches multiple full pages then stops on partial page', async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => makeTC(i, 'Manual'))
    const lastPage = Array.from({ length: 30 }, (_, i) => makeTC(i + 100, 'Manual'))
    mockQtestFetch
      .mockResolvedValueOnce(fullPage)
      .mockResolvedValueOnce(fullPage)
      .mockResolvedValueOnce(lastPage)
    const result = await getTestCases({ projectId: '1', moduleId: 10 })
    expect(mockQtestFetch).toHaveBeenCalledTimes(3)
    expect(result).toHaveLength(230)
  })

  it('returns all test cases with no filters', async () => {
    const tcs = [makeTC(1, 'Manual'), makeTC(2, 'Automated')]
    mockQtestFetch.mockResolvedValueOnce(tcs)
    const result = await getTestCases({ projectId: '1', moduleId: 10 })
    expect(result).toHaveLength(2)
  })

  it('filters by single field (Manual only)', async () => {
    const tcs = [makeTC(1, 'Manual'), makeTC(2, 'Automated')]
    mockQtestFetch.mockResolvedValueOnce(tcs)
    const result = await getTestCases({
      projectId: '1',
      moduleId: 10,
      filters: [{ field: 'Type', value: 'Manual' }],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('filter value comparison is case-insensitive against field_value_name', async () => {
    const tcs = [makeTC(1, 'Automated'), makeTC(2, 'Manual')]
    mockQtestFetch.mockResolvedValueOnce(tcs)
    const result = await getTestCases({
      projectId: '1',
      moduleId: 10,
      filters: [{ field: 'Type', value: 'automated' }],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('multi-filter AND logic: only cases matching all filters returned', async () => {
    const tc1 = {
      id: 1,
      name: 'TC-1',
      properties: [
        { field_name: 'Type', field_value_name: 'Manual' },
        { field_name: 'Status', field_value_name: 'Active' },
      ],
    }
    const tc2 = {
      id: 2,
      name: 'TC-2',
      properties: [
        { field_name: 'Type', field_value_name: 'Manual' },
        { field_name: 'Status', field_value_name: 'Inactive' },
      ],
    }
    mockQtestFetch.mockResolvedValueOnce([tc1, tc2])
    const result = await getTestCases({
      projectId: '1',
      moduleId: 10,
      filters: [
        { field: 'Type', value: 'Manual' },
        { field: 'Status', value: 'Active' },
      ],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('field and value lookup is case-insensitive', async () => {
    const tcs = [makeTC(1, 'Manual')]
    mockQtestFetch.mockResolvedValueOnce(tcs)
    const result = await getTestCases({
      projectId: '1',
      moduleId: 10,
      filters: [{ field: 'type', value: 'manual' }],
    })
    expect(result).toHaveLength(1)
  })

  it('filters by top-level field (e.g. version)', async () => {
    const tc1 = { id: 1, name: 'TC-1', version: '1.0', properties: [] }
    const tc2 = { id: 2, name: 'TC-2', version: '2.0', properties: [] }
    mockQtestFetch.mockResolvedValueOnce([tc1, tc2])
    const result = await getTestCases({
      projectId: '1',
      moduleId: 10,
      filters: [{ field: 'version', value: '1.0' }],
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('applies extractArray to each paginated response', async () => {
    mockQtestFetch.mockResolvedValueOnce({ items: [makeTC(1, 'Manual')] })
    const result = await getTestCases({ projectId: '1', moduleId: 10 })
    expect(result).toHaveLength(1)
  })
})
