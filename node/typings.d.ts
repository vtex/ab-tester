import {  ServiceContext } from '@vtex/api'
import { Clients } from './clients'

declare global {

  type Context = ServiceContext<Clients>

  interface WorkspaceData {
    Workspace: string
    Sessions: number
    OrderSessions: number
    NoOrderSessions: number
    Conversion: number
    OrdersValue: number
    OrdersValueHistory: number[]
  }

  interface WorkspaceCompleteData {
    Last24Hours: WorkspaceData
    SinceBeginning: WorkspaceData
  }

  interface TestResult {
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

  interface ABTestParameters {
    a: number
    b: number
  }
}