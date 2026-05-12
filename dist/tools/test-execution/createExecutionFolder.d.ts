export interface CreateExecutionFolderArgs {
    projectId: string;
    name: string;
    parentId?: number;
}
export interface ExecutionFolder {
    id: number;
    name: string;
    parentId?: number;
}
export declare function createExecutionFolder(args: CreateExecutionFolderArgs): Promise<ExecutionFolder>;
//# sourceMappingURL=createExecutionFolder.d.ts.map