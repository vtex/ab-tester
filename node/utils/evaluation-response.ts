export const DefaultEvaluationResponseConversion = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: 0,
    ConversionALast24Hours: 0,
    ConversionB: 0,
    ConversionBLast24Hours: 0,
    ExpectedLossChoosingA: 0,
    ExpectedLossChoosingB: 0,
    OrdersValueA: 0,
    OrdersValueALast24Hours: 0,
    OrdersValueB: 0,
    OrdersValueBLast24Hours: 0,
    PValue: 0,
    ProbabilityAlternativeBeatMaster: 0,
    Winner: 'Not yet decided',
    WorkspaceA: workspaceAName,
    WorkspaceASessions: 0,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceB: workspaceBName,
    WorkspaceBSessions: 0,
    WorkspaceBSessionsLast24Hours: 0,
})

export const DefaultEvaluationResponseRevenue = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: 0,
    ConversionALast24Hours: 0,
    ConversionB: 0,
    ConversionBLast24Hours: 0,
    ExpectedLossChoosingA: 0,
    ExpectedLossChoosingB: 0,
    OrdersValueA: 0,
    OrdersValueALast24Hours: 0,
    OrdersValueB: 0,
    OrdersValueBLast24Hours: 0,
    PValue: 0,
    ProbabilityAlternativeBeatMaster: 0,
    Winner: 'Not yet decided',
    WorkspaceA: workspaceAName,
    WorkspaceASessions: 0,
    WorkspaceASessionsLast24Hours: 0,
    WorkspaceB: workspaceBName,
    WorkspaceBSessions: 0,
    WorkspaceBSessionsLast24Hours: 0,
    WinnerRevenue: 'Not yet decided',
    PValueRevenue: 0,
    ProbabilityAlternativeBeatsMasterRevenue: 0,
    UValue: 0,
    EffectSizeWorkspaceA: 0,
    EffectSizeWorkspaceB: 0,
    OrdersMedianWorkspaceA: 0,
    OrdersMedianWorkspaceB: 0,
})

export const EvaluationResponseConversion = (abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData, winner: string, lossA: number, lossB: number, probabilityOneBeatsTwo: number, pValue: number): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: workspaceAData.SinceBeginning.Conversion,
    ConversionALast24Hours: workspaceAData.Last24Hours.Conversion,
    ConversionB: workspaceBData.SinceBeginning.Conversion,
    ConversionBLast24Hours: workspaceBData.Last24Hours.Conversion,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    OrdersValueA: workspaceAData.SinceBeginning.OrdersValue,
    OrdersValueALast24Hours: workspaceAData.Last24Hours.OrdersValue,
    OrdersValueB: workspaceBData.SinceBeginning.OrdersValue,
    OrdersValueBLast24Hours: workspaceBData.Last24Hours.OrdersValue,
    PValue : pValue,
    ProbabilityAlternativeBeatMaster: probabilityOneBeatsTwo,
    Winner: winner,
    WorkspaceA: workspaceAData.SinceBeginning.Workspace,
    WorkspaceASessions: workspaceAData.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceAData.Last24Hours.Sessions,
    WorkspaceB: workspaceBData.SinceBeginning.Workspace,
    WorkspaceBSessions: workspaceBData.SinceBeginning.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceBData.Last24Hours.Sessions,
})

export const EvaluationResponseRevenue = (abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData, winner: string, lossA: number, lossB: number, probabilityOneBeatTwo: number, pValue: number, 
    winnerRevenue: string, pValueRevenue: number, uValue: number, effectSizeA: number, effectSizeB: number, medianA: number, medianB: number): TestResult => ({

    ABTestBeginning: abTestBeginning,
    ConversionA: workspaceAData.SinceBeginning.Conversion,
    ConversionALast24Hours: workspaceAData.Last24Hours.Conversion,
    ConversionB: workspaceBData.SinceBeginning.Conversion,
    ConversionBLast24Hours: workspaceBData.Last24Hours.Conversion,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    OrdersValueA: workspaceAData.SinceBeginning.OrdersValue,
    OrdersValueALast24Hours: workspaceAData.Last24Hours.OrdersValue,
    OrdersValueB: workspaceBData.SinceBeginning.OrdersValue,
    OrdersValueBLast24Hours: workspaceBData.Last24Hours.OrdersValue,
    PValue : pValue,
    ProbabilityAlternativeBeatMaster: probabilityOneBeatTwo,
    Winner: winner,
    WorkspaceA: workspaceAData.SinceBeginning.Workspace,
    WorkspaceASessions: workspaceAData.SinceBeginning.Sessions,
    WorkspaceASessionsLast24Hours: workspaceAData.Last24Hours.Sessions,
    WorkspaceB: workspaceBData.SinceBeginning.Workspace,
    WorkspaceBSessions: workspaceBData.SinceBeginning.Sessions,
    WorkspaceBSessionsLast24Hours: workspaceBData.Last24Hours.Sessions,
    WinnerRevenue: winnerRevenue,
    PValueRevenue: pValueRevenue,
    ProbabilityAlternativeBeatsMasterRevenue: 1 - pValueRevenue,
    UValue: uValue,
    EffectSizeWorkspaceA: effectSizeA,
    EffectSizeWorkspaceB: effectSizeB,
    OrdersMedianWorkspaceA: medianA,
    OrdersMedianWorkspaceB: medianB,
})