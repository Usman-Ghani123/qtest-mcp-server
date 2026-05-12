import { config } from '../../config.js';
import { qtestFetch, extractArray } from '../../client.js';
export async function getModules(args) {
    const { projectId, parentId, query } = args;
    let endpoint;
    if (query !== undefined) {
        endpoint = `/modules?search=${encodeURIComponent(query)}&size=50`;
    }
    else if (parentId !== undefined) {
        endpoint = `/modules?parentId=${parentId}&size=100`;
    }
    else {
        endpoint = `/modules?size=100`;
    }
    const raw = await qtestFetch(config, projectId, endpoint, 'GET');
    return extractArray(raw);
}
//# sourceMappingURL=getModules.js.map