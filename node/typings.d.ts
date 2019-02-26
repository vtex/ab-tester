import { Context as KoaContext } from 'koa'
import { IOContext, ErrorLog } from '@vtex/api'
import { Resources } from './resources/index'
declare global{
  export interface ColossusContext extends KoaContext {
    vtex: IOContext
    resources: Resources
  }

  export interface ABTestData {
    Id: string
    timeStart: string
  }
  export interface WorkspaceData {
    Workspace: string
    Sessions: number
    OrderSessions: number
    NoOrderSessions: number
  }
  export interface TestResult {
    Winner: string
    ExpectedLossChoosingA: number
    ExpectedLossChoosingB: number
    KullbackLeibler: number
  }
}