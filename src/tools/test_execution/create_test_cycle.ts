import { config } from '@/config.js'
import { qtestFetch } from '@/client.js'

export interface CreateExecutionFolderArgs {
  projectId: string
  name: string
  parentId?: number
}

export interface ExecutionFolder {
  id: number
  name: string
  parentId?: number
}

export async function createExecutionFolder(
  args: CreateExecutionFolderArgs
): Promise<ExecutionFolder> {
  const { projectId, name, parentId } = args
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
