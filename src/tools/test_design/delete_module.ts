import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestModule, QTestTestCase } from '@/types.js'

export interface DeleteModuleArgs {
  projectId: string
  id?: number
  pid?: string
}

export interface DeleteModuleResult {
  deleted: true
  module: QTestModule
}

async function deleteModuleRecursive(projectId: string, id: number): Promise<void> {
  const childrenRaw = await qtestFetch(config, projectId, `/modules?parentId=${id}&size=100`, 'GET')
  const children = extractArray<QTestModule>(childrenRaw)
  for (const child of children) {
    await deleteModuleRecursive(projectId, child.id)
  }

  let page = 1
  while (true) {
    const casesRaw = await qtestFetch(
      config, projectId,
      `/test-cases?parentId=${id}&parentType=module&page=${page}&size=100`,
      'GET'
    )
    const cases = extractArray<QTestTestCase>(casesRaw)
    for (const tc of cases) {
      await qtestFetch(config, projectId, `/test-cases/${tc.id}`, 'DELETE')
    }
    if (cases.length < 100) break
    page++
  }

  await qtestFetch(config, projectId, `/modules/${id}`, 'DELETE')
}

export async function deleteModule(
  args: DeleteModuleArgs
): Promise<DeleteModuleResult> {
  const { projectId, pid } = args
  let { id } = args

  if (id === undefined) {
    if (pid === undefined) throw new Error('Provide either id or pid')
    const allRaw = await qtestFetch(config, projectId, '/modules', 'GET')
    const all = extractArray<QTestModule>(allRaw)
    const match = all.find((m) => m.pid === pid)
    if (!match) throw new Error(`No test module found with pid "${pid}"`)
    id = match.id
  }

  const raw = await qtestFetch(config, projectId, `/modules/${id}`, 'GET')
  const moduleInfo = raw as QTestModule

  await deleteModuleRecursive(projectId, id)

  return { deleted: true, module: moduleInfo }
}
