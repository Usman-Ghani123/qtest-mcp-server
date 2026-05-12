export interface QTestModule {
    id: number;
    name: string;
    parentId?: number;
}
export type QTestFolder = QTestModule;
export interface QTestProperty {
    field_name: string;
    field_value_name: string;
}
export interface QTestTestCase {
    id: number;
    name: string;
    version?: string;
    pid?: string;
    description?: string;
    precondition?: string;
    properties: QTestProperty[];
    [key: string]: unknown;
}
export interface QTestTestRun {
    id: number;
    name: string;
}
//# sourceMappingURL=types.d.ts.map