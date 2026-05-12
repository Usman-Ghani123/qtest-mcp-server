import { config } from '../../config.js';
import { qtestFetch } from '../../client.js';
export async function createModule(args) {
    const { projectId, name, parentId } = args;
    const endpoint = parentId !== undefined
        ? `/modules?parentId=${parentId}&parentType=module`
        : `/modules?parentType=root`;
    const result = await qtestFetch(config, projectId, endpoint, 'POST', { name });
    return result;
}
//# sourceMappingURL=createModule.js.map