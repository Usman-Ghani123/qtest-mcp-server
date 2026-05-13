export interface QTestProject {
  id: number
  name: string
  description?: string
  statusId?: number
  startDate?: string
  endDate?: string
}

export interface QTestModule {
  id: number
  name: string
  pid?: string
  parentId?: number
}

export type QTestFolder = QTestModule

export interface QTestProperty {
  field_name: string
  field_value_name: string
}

export interface QTestTestCase {
  id: number
  name: string
  version?: string
  pid?: string
  description?: string
  precondition?: string
  properties: QTestProperty[]
  [key: string]: unknown
}

export interface QTestTestRun {
  id: number
  name: string
}

export interface QTestTestSuite {
  id: number
  name: string
}

export interface QTestTestCycle {
  id: number
  name: string
  pid?: string
  parentId?: number
  description?: string
  children?: QTestTestCycle[]
}
