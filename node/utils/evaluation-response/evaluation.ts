export const EvaluationResponseBayesianConversion = (abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData,
    winner: string, probabilityAbeatsB: number, lossA: number, lossB: number): BayesianEvaluationResultConversion => ({

    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceA.SinceBeginning.Workspace,
    WorkspaceB: workspaceB.SinceBeginning.Workspace,
    Winner: winner,
    WorkspaceASessions: workspaceA.SinceBeginning.Sessions,
    WorkspaceBSessions: workspaceB.SinceBeginning.Sessions,
    ConversionRateA: workspaceA.SinceBeginning.Conversion / workspaceA.SinceBeginning.Sessions,
    ConversionRateB: workspaceB.SinceBeginning.Conversion / workspaceB.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceA.Last24Hours.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceB.Last24Hours.Sessions,
    ConversionRateALast24Hours: workspaceA.Last24Hours.Conversion / workspaceA.Last24Hours.Sessions,
    ConversionRateBLast24Hours: workspaceB.Last24Hours.Conversion / workspaceB.Last24Hours.Sessions,
    ProbabilityAbeatsB: probabilityAbeatsB,
    ProbabilityBbeatsA: 1 - probabilityAbeatsB,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB
})

export const EvaluationResponseBayesianRevenue = (abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData,
    winner: string, probabilityAbeatsB: number, lossA: number, lossB: number): BayesianEvaluationResultRevenue => ({

    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceA.SinceBeginning.Workspace,
    WorkspaceB: workspaceB.SinceBeginning.Workspace,
    Winner: winner,
    WorkspaceASessions: workspaceA.SinceBeginning.Sessions,
    WorkspaceBSessions: workspaceB.SinceBeginning.Sessions,
    AverageRevenueA: workspaceA.SinceBeginning.OrdersValue / workspaceA.SinceBeginning.Sessions,
    AverageRevenueB: workspaceB.SinceBeginning.OrdersValue / workspaceB.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceA.Last24Hours.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceB.Last24Hours.Sessions,
    AverageRevenueALast24Hours: workspaceA.Last24Hours.OrdersValue / workspaceA.Last24Hours.Sessions,
    AverageRevenueBLast24Hours: workspaceB.Last24Hours.OrdersValue / workspaceB.Last24Hours.Sessions,
    ProbabilityAbeatsB: probabilityAbeatsB,
    ProbabilityBbeatsA: 1 - probabilityAbeatsB,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB
})

export const EvaluationResponseFrequentistConversion = (abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData,
    winner: string, pValue: number, upLiftChoosingA: number, upLiftChoosingB: number): FrequentistEvaluationResultConversion => ({

    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceA.SinceBeginning.Workspace,
    WorkspaceB: workspaceB.SinceBeginning.Workspace,
    Winner: winner,
    PValue: pValue,
    WorkspaceASessions: workspaceA.SinceBeginning.Sessions,
    WorkspaceBSessions: workspaceB.SinceBeginning.Sessions,
    ConversionRateA: workspaceA.SinceBeginning.Conversion / workspaceA.SinceBeginning.Sessions,
    ConversionRateB: workspaceB.SinceBeginning.Conversion / workspaceB.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceA.Last24Hours.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceB.Last24Hours.Sessions,
    ConversionRateALast24Hours: workspaceA.Last24Hours.Conversion / workspaceA.Last24Hours.Sessions,
    ConversionRateBLast24Hours: workspaceB.Last24Hours.Conversion / workspaceB.Last24Hours.Sessions,
    UpLiftChoosingA: upLiftChoosingA,
    UpLiftChoosingB: upLiftChoosingB
})

export const EvaluationResponseFrequentistRevenue = (abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData,
    winner: string, pValue: number, upLiftChoosingA: number, upLiftChoosingB: number): FrequentistEvaluationResultRevenue => ({

    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceA.SinceBeginning.Workspace,
    WorkspaceB: workspaceB.SinceBeginning.Workspace,
    Winner: winner,
    PValue: pValue,
    WorkspaceASessions: workspaceA.SinceBeginning.Sessions,
    WorkspaceBSessions: workspaceB.SinceBeginning.Sessions,
    AverageRevenueA: workspaceA.SinceBeginning.OrdersValue / workspaceA.SinceBeginning.Sessions,
    AverageRevenueB: workspaceB.SinceBeginning.OrdersValue / workspaceB.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceA.Last24Hours.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceB.Last24Hours.Sessions,
    AverageRevenueALast24Hours: workspaceA.Last24Hours.OrdersValue / workspaceA.Last24Hours.Sessions,
    AverageRevenueBLast24Hours: workspaceB.Last24Hours.OrdersValue / workspaceB.Last24Hours.Sessions,
    UpLiftChoosingA: upLiftChoosingA,
    UpLiftChoosingB: upLiftChoosingB
})