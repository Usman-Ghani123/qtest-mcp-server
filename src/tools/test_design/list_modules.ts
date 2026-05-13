import { config } from '@/config.js'
import { qtestFetch, extractArray } from '@/client.js'
import type { QTestFolder } from '@/types.js'

export interface ListModulesArgs {
  projectId: string
  parentId?: number
  query?: string
}

export async function listModules(args: ListModulesArgs): Promise<QTestFolder[]> {
  const { projectId, parentId, query } = args
  let endpoint: string

  if (query !== undefined) {
    endpoint = `/modules?search=${encodeURIComponent(query)}&size=50`
  } else if (parentId !== undefined) {
    endpoint = `/modules?parentId=${parentId}&size=100`
  } else {
    endpoint = `/modules?size=100`
  }

  const raw = await qtestFetch(config, projectId, endpoint, 'GET')
  return extractArray<QTestFolder>(raw)
}
