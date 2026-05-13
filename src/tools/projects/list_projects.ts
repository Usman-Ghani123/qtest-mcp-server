import { config } from '@/config.js'
import { qtestFetchGlobal, extractArray } from '@/client.js'
import type { QTestProject } from '@/types.js'

export interface ListProjectsArgs {
  projectId?: number
}

export async function listProjects(args: ListProjectsArgs): Promise<QTestProject | QTestProject[]> {
  const { projectId } = args

  if (projectId !== undefined) {
    const raw = await qtestFetchGlobal(config, `/projects/${projectId}`, 'GET')
    return raw as QTestProject
  }

  const raw = await qtestFetchGlobal(config, '/projects', 'GET')
  return extractArray<QTestProject>(raw)
}
