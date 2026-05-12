import type { QTestTestCase } from '../../types.js';
export interface GetTestCasesArgs {
    projectId: string;
    moduleId: number;
    filters?: Array<{
        field: string;
        value: string;
    }>;
}
export declare function getTestCases(args: GetTestCasesArgs): Promise<QTestTestCase[]>;
//# sourceMappingURL=getTestCases.d.ts.map