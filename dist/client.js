export async function qtestFetchGlobal(config, endpoint, method, body) {
    const url = `${config.baseUrl}/api/v3${endpoint}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
}
export async function qtestFetch(config, projectId, endpoint, method, body) {
    const url = `${config.baseUrl}/api/v3/projects/${projectId}${endpoint}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.token}`,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
    }
    return response.json();
}
export function extractArray(raw) {
    if (Array.isArray(raw))
        return raw;
    if (raw && typeof raw === 'object') {
        for (const key of ['items', 'data', 'object']) {
            const val = raw[key];
            if (Array.isArray(val))
                return val;
        }
    }
    return [];
}
//# sourceMappingURL=client.js.map