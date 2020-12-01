export function DefaultEvaluationResponse(abTestBeginning: string, workspaceAName: string, workspaceBName: string, testType: TestType, testApproach: TestApproach): EvaluationResult {
    return defaultEvaluationResponses[testApproach][testType](abTestBeginning, workspaceAName, workspaceBName)
}

export const DefaultResponseBayesianConversion = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): BayesianEvaluationResultConversion => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAName,
    WorkspaceB: workspaceBName,
    Winner: 'Not yet decided',
    WorkspaceASessions: 0,
    WorkspaceBSessions: 0,
    ConversionRateA: NaN,
    ConversionRateB: NaN,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceBSessionsLast24Hours: 0,
    ConversionRateALast24Hours: NaN,
    ConversionRateBLast24Hours: NaN,
    ProbabilityAbeatsB: NaN,
    ProbabilityBbeatsA: NaN,
    ExpectedLossChoosingA: NaN,
    ExpectedLossChoosingB: NaN
})

export const DefaultResponseBayesianRevenue = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): BayesianEvaluationResultRevenue => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAName,
    WorkspaceB: workspaceBName,
    Winner: 'Not yet decided',
    WorkspaceASessions: 0,
    WorkspaceBSessions: 0,
    AverageRevenueA: NaN,
    AverageRevenueB: NaN,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceBSessionsLast24Hours: 0,
    AverageRevenueALast24Hours: NaN,
    AverageRevenueBLast24Hours: NaN,
    ProbabilityAbeatsB: NaN,
    ProbabilityBbeatsA: NaN,
    ExpectedLossChoosingA: NaN,
    ExpectedLossChoosingB: NaN
})

export const DefaultResponseFrequentistConversion = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): FrequentistEvaluationResultConversion => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAName,
    WorkspaceB: workspaceBName,
    Winner: 'Not yet decided',
    PValue: NaN,
    WorkspaceASessions: 0,
    WorkspaceBSessions: 0,
    ConversionRateA: NaN,
    ConversionRateB: NaN,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceBSessionsLast24Hours: 0,
    ConversionRateALast24Hours: NaN,
    ConversionRateBLast24Hours: NaN,
    UpLiftChoosingA: NaN,
    UpLiftChoosingB: NaN
})

export const DefaultResponseFrequentistRevenue = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): FrequentistEvaluationResultRevenue => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAName,
    WorkspaceB: workspaceBName,
    Winner: 'Not yet decided',
    PValue: NaN,
    WorkspaceASessions: 0,
    WorkspaceBSessions: 0,
    AverageRevenueA: NaN,
    AverageRevenueB: NaN,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceBSessionsLast24Hours: 0,
    AverageRevenueALast24Hours: NaN,
    AverageRevenueBLast24Hours: NaN,
    UpLiftChoosingA: NaN,
    UpLiftChoosingB: NaN
})

const defaultEvaluationResponses = {
    "bayesian": {
        "conversion": DefaultResponseBayesianConversion,
        "revenue": DefaultResponseBayesianRevenue
    },
    "frequentist": {
        "conversion": DefaultResponseFrequentistConversion,
        "revenue": DefaultResponseFrequentistRevenue
    }
}