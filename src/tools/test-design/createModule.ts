import { config } from '../../config.js'
import { qtestFetch } from '../../client.js'
import type { QTestModule } from '../../types.js'

export interface CreateModuleArgs {
  projectId: string
  name: string
  parentId?: number
}

export async function createModule(args: CreateModuleArgs): Promise<QTestModule> {
  const { projectId, name, parentId } = args
  const endpoint =
    parentId !== undefined
      ? `/modules?parentId=${parentId}&parentType=module`
      : `/modules?parentType=root`

  const result = await qtestFetch(config, projectId, endpoint, 'POST', { name })
  return result as QTestModule
}
