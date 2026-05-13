import { config } from '@/config.js'
import { qtestFetch } from '@/client.js'

export interface AddTestCasesArgs {
  projectId: string
  suiteId: number
  testCases: Array<{ id: number; name: string }>
}

export interface AddTestCasesResult {
  added: number
}

export async function addTestCases(args: AddTestCasesArgs): Promise<AddTestCasesResult> {
  const { projectId, suiteId, testCases } = args
  let added = 0

  for (const tc of testCases) {
    try {
      await qtestFetch(
        config,
        projectId,
        `/test-runs?parentId=${suiteId}&parentType=test-suite`,
        'POST',
        { name: tc.name, test_case: { id: tc.id } }
      )
      added++
    } catch {
      // continue on individual failure — count only successes
    }
  }

  return { added }
}
