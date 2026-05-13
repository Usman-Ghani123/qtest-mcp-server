import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestTestCycle } from '@/types.js'

export interface ListTestCyclesArgs {
  projectId: string
  id?: number
  name?: string
  parentId?: number
}

export async function listTestCycles(
  args: ListTestCyclesArgs
): Promise<QTestTestCycle | QTestTestCycle[]> {
  const { projectId, id, name, parentId } = args

  if (id !== undefined) {
    const raw = await qtestFetch(config, projectId, `/test-cycles/${id}`, 'GET')
    return raw as QTestTestCycle
  }

  const endpoint = parentId !== undefined
    ? `/test-cycles?parentId=${parentId}&parentType=test-cycle`
    : '/test-cycles'

  const raw = await qtestFetch(config, projectId, endpoint, 'GET')
  const all = extractArray<QTestTestCycle>(raw)

  if (name !== undefined) {
    const lower = name.toLowerCase()
    return all.filter((c) => c.name.toLowerCase() === lower)
  }

  return all
}
