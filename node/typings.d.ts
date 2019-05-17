import { Context as KoaContext } from 'koa'
import { IOContext, Events } from '@vtex/api';
import { Resources } from './resources/index'
declare global {
  type LogLevel = 'info' | 'error' | 'warning' | 'debug'
  export interface ColossusContext extends KoaContext {
    vtex: IOContext
    resources: Resources
  }
  export interface EventsContext extends IOContext {
    resources: Resources
  }
  export interface ABTestData {
    Id: string
    dateOfBeginning: string
    probability: number
  }
  export interface WorkspaceData {
    Workspace: string
    Sessions: number
    OrderSessions: number
    NoOrderSessions: number
    Conversion: number
  }
  export interface WorkspaceCompleteData {
    Last24Hours: WorkspaceData
    SinceBeginning: WorkspaceData
  }
  export interface TestResult {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    WorkspaceASessions: number
    WorkspaceBSessions: number
    WorkspaceASessionsLast24Hours: number
    WorkspaceBSessionsLast24Hours: number
    Winner: string
    ExpectedLossChoosingA: number
    ConversionA: number
    ConversionALast24Hours: number
    ExpectedLossChoosingB: number
    ConversionB: number
    ConversionBLast24Hours: number
    ProbabilityAlternativeBeatMaster: number
  }
  export interface ABTestParameters {
    a: number
    b: number
  }
  export interface ABWorkspaceMetadata {
    name: string
    weight: number
    abTestParameters: ABTestParameters
    production: boolean
  }
}