import type { QTestConfig } from './config.js';
export type { QTestConfig };
export declare function qtestFetch(config: QTestConfig, projectId: string, endpoint: string, method: 'GET' | 'POST', body?: unknown): Promise<unknown>;
export declare function extractArray<T>(raw: unknown): T[];
//# sourceMappingURL=client.d.ts.map