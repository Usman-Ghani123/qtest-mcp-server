import { config } from '../../config.js';
import { qtestFetch } from '../../client.js';
export async function createExecutionFolder(args) {
    const { projectId, name, parentId } = args;
    const endpoint = parentId !== undefined
        ? `/test-cycles?parentId=${parentId}&parentType=test-cycle`
        : `/test-cycles?parentType=root`;
    const result = await qtestFetch(config, projectId, endpoint, 'POST', {
        name,
        description: '',
    });
    return result;
}
//# sourceMappingURL=createExecutionFolder.js.map