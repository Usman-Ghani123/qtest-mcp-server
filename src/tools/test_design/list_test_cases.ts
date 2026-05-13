import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestTestCase, QTestProperty } from '@/types.js'
import { parsePid } from '@/utils.js'

export interface GetTestCasesArgs {
  projectId: string
  moduleId?: number
  modulePid?: string
  filters?: Array<{ field: string; value: string }>
}

export async function getTestCases(args: GetTestCasesArgs): Promise<QTestTestCase[]> {
  const { projectId, filters } = args

  let resolvedModuleId: number
  if (args.moduleId !== undefined) {
    resolvedModuleId = args.moduleId
  } else if (args.modulePid !== undefined) {
    resolvedModuleId = parsePid(args.modulePid)
  } else {
    throw new Error('Provide either moduleId or modulePid')
  }

  const all: QTestTestCase[] = []
  let page = 1

  while (true) {
    const raw = await qtestFetch(
      config,
      projectId,
      `/test-cases?parentId=${resolvedModuleId}&parentType=module&page=${page}&size=100`,
      'GET'
    )
    const batch = extractArray<QTestTestCase>(raw)
    all.push(...batch)
    if (batch.length < 100) break
    page++
  }

  if (!filters || filters.length === 0) return all

  return all.filter((tc) =>
    filters.every((filter) => {
      const fieldNameLower = filter.field.toLowerCase()
      const filterValueLower = filter.value.toLowerCase()

      // Check top-level fields first (e.g. version, name, pid)
      const topLevelMatch = Object.entries(tc).find(
        ([k]) => k.toLowerCase() === fieldNameLower
      )
      if (topLevelMatch) {
        return String(topLevelMatch[1] ?? '').toLowerCase() === filterValueLower
      }

      // Fall back to properties array
      const prop = tc.properties?.find(
        (p: QTestProperty) => p.field_name.toLowerCase() === fieldNameLower
      )
      if (!prop) return false

      return prop.field_value_name.toLowerCase() === filterValueLower
    })
  )
}
