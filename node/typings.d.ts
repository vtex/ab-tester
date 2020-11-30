import {  ServiceContext } from '@vtex/api'
import { Clients } from './clients'

declare global {

  type Context = ServiceContext<Clients>

  type TestType = 'conversion' | 'revenue'

  type TestApproach = 'frequentist' | 'bayesian'

  type UrlParameter = string | string[] | undefined

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

  type TestResult = Array < WinnerOverAll | EvaluationResult >

  interface WinnerOverAll {
    Winner: string
  }

  interface EvaluationResult {
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
    WinnerRevenue?: string
    PValueRevenue?: number
    ProbabilityAlternativeBeatsMasterRevenue?: number
    EffectSizeWorkspaceA?: number
    EffectSizeWorkspaceB?: number
    OrdersMedianWorkspaceA?: number
    OrdersMedianWorkspaceB?: number
  }

  interface ABTestParameters {
    a: number
    b: number
  }
}