import { config } from '../../config.js';
import { qtestFetch, extractArray } from '../../client.js';
export async function getTestCases(args) {
    const { projectId, moduleId, filters } = args;
    const all = [];
    let page = 1;
    while (true) {
        const raw = await qtestFetch(config, projectId, `/test-cases?parentId=${moduleId}&parentType=module&page=${page}&size=100`, 'GET');
        const batch = extractArray(raw);
        all.push(...batch);
        if (batch.length < 100)
            break;
        page++;
    }
    if (!filters || filters.length === 0)
        return all;
    return all.filter((tc) => filters.every((filter) => {
        const fieldNameLower = filter.field.toLowerCase();
        const filterValueLower = filter.value.toLowerCase();
        // Check top-level fields first (e.g. version, name, pid)
        const topLevelMatch = Object.entries(tc).find(([k]) => k.toLowerCase() === fieldNameLower);
        if (topLevelMatch) {
            return String(topLevelMatch[1] ?? '').toLowerCase() === filterValueLower;
        }
        // Fall back to properties array
        const prop = tc.properties?.find((p) => p.field_name.toLowerCase() === fieldNameLower);
        if (!prop)
            return false;
        return prop.field_value_name.toLowerCase() === filterValueLower;
    }));
}
//# sourceMappingURL=getTestCases.js.map