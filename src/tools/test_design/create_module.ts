import { config } from '@/config.js'
import { qtestFetch } from '@/client.js'
import type { QTestModule } from '@/types.js'
import { parsePid } from '@/utils.js'

export interface CreateModuleArgs {
  projectId: string
  name: string
  parentId?: number
  parentPid?: string
}

export async function createModule(args: CreateModuleArgs): Promise<QTestModule> {
  let { parentId } = args
  const { projectId, name, parentPid } = args

  if (parentId === undefined && parentPid !== undefined) {
    parentId = parsePid(parentPid)
  }
  const endpoint =
    parentId !== undefined
      ? `/modules?parentId=${parentId}&parentType=module`
      : `/modules?parentType=root`

  const result = await qtestFetch(config, projectId, endpoint, 'POST', { name })
  return result as QTestModule
}
