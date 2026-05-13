import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestTestCycle } from '@/types.js'

export interface DeleteTestCycleArgs {
  projectId: string
  id: number
}

export interface DeleteTestCycleResult {
  deleted: true
  cycle: QTestTestCycle
}

async function deleteRecursive(projectId: string, id: number): Promise<void> {
  const childrenRaw = await qtestFetch(
    config, projectId,
    `/test-cycles?parentId=${id}&parentType=test-cycle`,
    'GET'
  )
  const children = extractArray<QTestTestCycle>(childrenRaw)
  for (const child of children) {
    await deleteRecursive(projectId, child.id)
  }
  await qtestFetch(config, projectId, `/test-cycles/${id}`, 'DELETE')
}

export async function deleteTestCycle(
  args: DeleteTestCycleArgs
): Promise<DeleteTestCycleResult> {
  const { projectId, id } = args

  const raw = await qtestFetch(config, projectId, `/test-cycles/${id}`, 'GET')
  const cycleInfo = raw as QTestTestCycle

  await deleteRecursive(projectId, id)

  return { deleted: true, cycle: cycleInfo }
}
