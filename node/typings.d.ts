import {  ServiceContext } from '@vtex/api'
import { Clients } from './clients'
declare global {
  type LogLevel = 'info' | 'error' | 'warning' | 'debug'

  type Context = ServiceContext<Clients>

  export interface WorkspaceData {
    Workspace: string
    Sessions: number
    OrderSessions: number
    NoOrderSessions: number
    Conversion: number
    OrdersValue: number
    OrdersValueHistory: number[]
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
    PValue: number
    OrdersValueA: number
    OrdersValueB: number
    OrdersValueALast24Hours: number
    OrdersValueBLast24Hours: number
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