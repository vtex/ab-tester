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

  type EvaluationResult = BayesianEvaluationResultConversion | BayesianEvaluationResultRevenue | FrequentistEvaluationResultConversion | FrequentistEvaluationResultRevenue

  interface BayesianEvaluationResultConversion {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    Winner: string
    WorkspaceASessions: number
    WorkspaceBSessions: number
    ConversionRateA: number
    ConversionRateB: number
    WorkspaceASessionsLast24Hours: number
    WorkspaceBSessionsLast24Hours: number
    ConversionRateALast24Hours: number
    ConversionRateBLast24Hours: number
    ProbabilityAbeatsB: number
    ProbabilityBbeatsA: number
    ExpectedLossChoosingA: number
    ExpectedLossChoosingB: number
  }

  interface BayesianEvaluationResultRevenue {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    Winner: string
    WorkspaceASessions: number
    WorkspaceBSessions: number
    AverageRevenueA: number
    AverageRevenueB: number
    WorkspaceASessionsLast24Hours: number
    WorkspaceBSessionsLast24Hours: number
    AverageRevenueALast24Hours: number
    AverageRevenueBLast24Hours: number
    ProbabilityAbeatsB: number
    ProbabilityBbeatsA: number
    ExpectedLossChoosingA: number
    ExpectedLossChoosingB: number
  }

  interface FrequentistEvaluationResultConversion {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    Winner: string
    PValue: number
    WorkspaceASessions: number
    WorkspaceBSessions: number
    ConversionRateA: number
    ConversionRateB: number
    WorkspaceASessionsLast24Hours: number
    WorkspaceBSessionsLast24Hours: number
    ConversionRateALast24Hours: number
    ConversionRateBLast24Hours: number
    UpLiftChoosingA: number
    UpLiftChoosingB: number
  }

  interface FrequentistEvaluationResultRevenue {
    ABTestBeginning: string
    WorkspaceA: string
    WorkspaceB: string
    Winner: string
    PValue: number
    WorkspaceASessions: number
    WorkspaceBSessions: number
    AverageRevenueA: number
    AverageRevenueB: number
    WorkspaceASessionsLast24Hours: number
    WorkspaceBSessionsLast24Hours: number
    AverageRevenueALast24Hours: number
    AverageRevenueBLast24Hours: number
    UpLiftChoosingA: number
    UpLiftChoosingB: number
  }

  type proportion = number

  interface BetaParameters {
    a: number
    b: number
  }
}