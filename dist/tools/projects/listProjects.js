import { config } from '../../config.js';
import { qtestFetchGlobal, extractArray } from '../../client.js';
export async function listProjects(args) {
    const { projectId } = args;
    if (projectId !== undefined) {
        const raw = await qtestFetchGlobal(config, `/projects/${projectId}`, 'GET');
        return raw;
    }
    const raw = await qtestFetchGlobal(config, '/projects', 'GET');
    return extractArray(raw);
}
//# sourceMappingURL=listProjects.js.map