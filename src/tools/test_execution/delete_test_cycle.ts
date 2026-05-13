import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestTestCycle, QTestTestRun, QTestTestSuite } from '@/types.js'
import { parsePid } from '@/utils.js'

export interface DeleteTestCycleArgs {
  projectId: string
  id?: number
  pid?: string
}

export interface DeleteTestCycleResult {
  deleted: true
  cycle: QTestTestCycle
}

async function deleteRecursive(projectId: string, id: number): Promise<void> {
  const suitesRaw = await qtestFetch(
    config, projectId,
    `/test-suites?parentId=${id}&parentType=test-cycle`,
    'GET'
  )
  const suites = extractArray<QTestTestSuite>(suitesRaw)
  for (const suite of suites) {
    const runsRaw = await qtestFetch(
      config, projectId,
      `/test-runs?parentId=${suite.id}&parentType=test-suite`,
      'GET'
    )
    const runs = extractArray<QTestTestRun>(runsRaw)
    for (const run of runs) {
      await qtestFetch(config, projectId, `/test-runs/${run.id}`, 'DELETE')
    }
    await qtestFetch(config, projectId, `/test-suites/${suite.id}`, 'DELETE')
  }

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
  const { projectId, pid } = args
  let { id } = args

  if (id === undefined) {
    if (pid === undefined) throw new Error('Provide either id or pid')
    id = parsePid(pid)
  }

  const raw = await qtestFetch(config, projectId, `/test-cycles/${id}`, 'GET')
  const cycleInfo = raw as QTestTestCycle

  await deleteRecursive(projectId, id)

  return { deleted: true, cycle: cycleInfo }
}
