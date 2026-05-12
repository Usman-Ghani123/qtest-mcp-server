export interface AddTestCasesArgs {
    projectId: string;
    suiteId: number;
    testCases: Array<{
        id: number;
        name: string;
    }>;
}
export interface AddTestCasesResult {
    added: number;
}
export declare function addTestCases(args: AddTestCasesArgs): Promise<AddTestCasesResult>;
//# sourceMappingURL=addTestCases.d.ts.map