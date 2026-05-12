import type { QTestModule } from '../../types.js';
export interface CreateModuleArgs {
    projectId: string;
    name: string;
    parentId?: number;
}
export declare function createModule(args: CreateModuleArgs): Promise<QTestModule>;
//# sourceMappingURL=createModule.d.ts.map