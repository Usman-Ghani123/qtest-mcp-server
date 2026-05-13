import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestTestCycle } from '@/types.js'

export interface ListTestCyclesArgs {
  projectId: string
  id?: number
  name?: string
  pid?: string
  parentId?: number
}

async function fetchCycleTree(projectId: string, cycle: QTestTestCycle): Promise<QTestTestCycle> {
  const childrenRaw = await qtestFetch(
    config, projectId,
    `/test-cycles?parentId=${cycle.id}&parentType=test-cycle`,
    'GET'
  )
  const children = extractArray<QTestTestCycle>(childrenRaw)
  if (children.length > 0) {
    const childTrees: QTestTestCycle[] = []
    for (const child of children) {
      childTrees.push(await fetchCycleTree(projectId, child))
    }
    cycle.children = childTrees
  }
  return cycle
}

export async function listTestCycles(
  args: ListTestCyclesArgs
): Promise<QTestTestCycle | QTestTestCycle[]> {
  const { projectId, id, name, pid, parentId } = args

  if (id !== undefined) {
    const raw = await qtestFetch(config, projectId, `/test-cycles/${id}`, 'GET')
    return fetchCycleTree(projectId, raw as QTestTestCycle)
  }

  const endpoint = parentId !== undefined
    ? `/test-cycles?parentId=${parentId}&parentType=test-cycle`
    : '/test-cycles'

  const raw = await qtestFetch(config, projectId, endpoint, 'GET')
  const all = extractArray<QTestTestCycle>(raw)

  if (pid !== undefined) {
    const filtered = all.filter((c) => c.pid === pid)
    const trees: QTestTestCycle[] = []
    for (const c of filtered) {
      trees.push(await fetchCycleTree(projectId, c))
    }
    return trees
  }

  if (name !== undefined) {
    const lower = name.toLowerCase()
    return all.filter((c) => c.name.toLowerCase() === lower)
  }

  return all
}
