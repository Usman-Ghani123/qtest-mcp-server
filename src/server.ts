import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { getTestCases } from '@/tools/test_design/list_test_cases.js'
import { getModules } from '@/tools/test_design/list_test_design_modules.js'
import { createModule } from '@/tools/test_design/create_test_design_module.js'
import { createExecutionFolder } from '@/tools/test_execution/create_test_cycle.js'
import { addTestCases } from '@/tools/test_execution/add_test_cases.js'
import { listProjects } from '@/tools/projects/list_projects.js'
import { listTestCycles } from '@/tools/test_execution/list_test_cycle.js'
import { deleteTestCycle } from '@/tools/test_execution/delete_test_cycle.js'
import { deleteTestModule } from '@/tools/test_design/delete_test_module.js'

export const server = new McpServer(
  { name: 'qtest-mcp-server', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.registerTool(
  'list-test-cases',
  {
    description:
      'Test Design — fetch test cases from a qTest module with optional property filters (Type, Status, Priority, version, etc.)',
    inputSchema: {
      projectId: z.string().describe('Numeric project ID as string'),
      moduleId: z.number().int().describe('ID of the module to fetch test cases from'),
      filters: z
        .array(
          z.object({
            field: z.string().describe('Field name — top-level (e.g. "version") or property (e.g. "Type", "Status")'),
            value: z.string().describe('Value to match (case-insensitive)'),
          })
        )
        .optional()
        .describe('Filter by fields (AND logic); omit to return all'),
    },
  },
  async ({ projectId, moduleId, filters }) => {
    const result = await getTestCases({ projectId, moduleId, filters })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'list-test-design-modules',
  {
    description:
      'Test Design — list qTest Test Design modules. Pass query to search by name, parentId to list children, or neither for root-level listing',
    inputSchema: {
      projectId: z.string(),
      parentId: z.number().int().optional().describe('List children of this module ID'),
      query: z.string().optional().describe('Search modules by name'),
    },
  },
  async ({ projectId, parentId, query }) => {
    const result = await getModules({ projectId, parentId, query })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'create-test-design-module',
  {
    description: 'Test Design — create a new module in qTest Test Design to organise test cases',
    inputSchema: {
      projectId: z.string(),
      name: z.string().describe('Name of the new module'),
      parentId: z.number().int().optional().describe('Parent module ID; omit to create at root'),
    },
  },
  async ({ projectId, name, parentId }) => {
    const result = await createModule({ projectId, name, parentId })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'create-test-cycle',
  {
    description:
      'Test Execution — create a test cycle (execution folder) in qTest Test Execution to group test runs for a sprint, release, or regression campaign',
    inputSchema: {
      projectId: z.string(),
      name: z.string().describe('Name of the new test cycle'),
      parentId: z
        .number()
        .int()
        .optional()
        .describe('Parent test cycle ID; omit to create at root'),
    },
  },
  async ({ projectId, name, parentId }) => {
    const result = await createExecutionFolder({ projectId, name, parentId })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'add-test-cases',
  {
    description:
      'Test Execution — add test cases as test runs into a qTest Test Execution suite (inside a test cycle)',
    inputSchema: {
      projectId: z.string(),
      suiteId: z
        .number()
        .int()
        .describe('ID of the test execution suite to add runs into'),
      testCases: z
        .array(z.object({ id: z.number().int(), name: z.string() }))
        .describe('Test cases to add as test runs'),
    },
  },
  async ({ projectId, suiteId, testCases }) => {
    const result = await addTestCases({ projectId, suiteId, testCases })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'list-projects',
  {
    description:
      'Projects — list all qTest projects, or fetch a single project by ID',
    inputSchema: {
      projectId: z.number().int().optional().describe('Project ID; omit to list all projects'),
    },
  },
  async ({ projectId }) => {
    const result = await listProjects({ projectId })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'list-test-cycle',
  {
    description:
      'Test Execution — list qTest test cycles. Omit all optional args for root-level listing, provide id for a single cycle, or provide name to filter by name (case-insensitive exact match)',
    inputSchema: {
      projectId: z.string().describe('Numeric project ID as string'),
      id: z.number().int().optional().describe('Test cycle ID; returns a single cycle'),
      name: z.string().optional().describe('Filter cycles by name (case-insensitive exact match)'),
      parentId: z.number().int().optional().describe('List child cycles of this parent test cycle ID'),
    },
  },
  async ({ projectId, id, name, parentId }) => {
    const result = await listTestCycles({ projectId, id, name, parentId })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'delete-test-cycle',
  {
    description:
      'Test Execution — delete a qTest test cycle by id. Cascades to all child test cycles and test runs automatically',
    inputSchema: {
      projectId: z.string().describe('Numeric project ID as string'),
      id: z.number().int().describe('Test cycle ID to delete'),
    },
  },
  async ({ projectId, id }) => {
    const result = await deleteTestCycle({ projectId, id: id! })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

server.registerTool(
  'delete-test-module',
  {
    description:
      'Test Design — delete a qTest test module by id. Cascades to all child modules and test cases automatically',
    inputSchema: {
      projectId: z.string().describe('Numeric project ID as string'),
      id: z.number().int().describe('Module ID to delete'),
    },
  },
  async ({ projectId, id }) => {
    const result = await deleteTestModule({ projectId, id: id! })
    return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] }
  }
)

export async function startServer(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}
