import type { QTestFolder } from '../../types.js';
export interface GetModulesArgs {
    projectId: string;
    parentId?: number;
    query?: string;
}
export declare function getModules(args: GetModulesArgs): Promise<QTestFolder[]>;
//# sourceMappingURL=getModules.d.ts.map