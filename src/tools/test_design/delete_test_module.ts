import { config } from '@/config.js'
import { qtestFetch } from '@/client.js'
import type { QTestModule } from '@/types.js'

export interface DeleteTestModuleArgs {
  projectId: string
  id: number
}

export interface DeleteTestModuleResult {
  deleted: true
  module: QTestModule
}

export async function deleteTestModule(
  args: DeleteTestModuleArgs
): Promise<DeleteTestModuleResult> {
  const { projectId, id } = args

  const raw = await qtestFetch(config, projectId, `/modules/${id}`, 'GET')
  const moduleInfo = raw as QTestModule

  await qtestFetch(config, projectId, `/modules/${id}`, 'DELETE')

  return { deleted: true, module: moduleInfo }
}
