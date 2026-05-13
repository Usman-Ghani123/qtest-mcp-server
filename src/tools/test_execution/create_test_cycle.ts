import { config } from '@/config.js'
import { qtestFetch } from '@/client.js'
import { parsePid } from '@/utils.js'

export interface CreateExecutionFolderArgs {
  projectId: string
  name: string
  parentId?: number
  parentPid?: string
}

export interface ExecutionFolder {
  id: number
  name: string
  parentId?: number
}

export async function createExecutionFolder(
  args: CreateExecutionFolderArgs
): Promise<ExecutionFolder> {
  let { parentId } = args
  const { projectId, name, parentPid } = args

  if (parentId === undefined && parentPid !== undefined) {
    parentId = parsePid(parentPid)
  }
  const endpoint =
    parentId !== undefined
      ? `/test-cycles?parentId=${parentId}&parentType=test-cycle`
      : `/test-cycles?parentType=root`

  const result = await qtestFetch(config, projectId, endpoint, 'POST', {
    name,
    description: '',
  })
  return result as ExecutionFolder
}
