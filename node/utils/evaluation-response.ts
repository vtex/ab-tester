export const DefaultEvaluationResponse = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): TestResult => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAName,
    WorkspaceB: workspaceBName,
    Winner: 'A/B Test not initialized for one of the workspaces or it does not already has visitors.',
    ExpectedLossChoosingA: 0,
    ConversionA: 0,
    ExpectedLossChoosingB: 0,
    ConversionB: 0,
    ProbabilityAlternativeBeatMaster: 0,
    KullbackLeibler: 0
})

export const EvaluationResponse = (abTestBeginning: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, winner: string, lossA: number, lossB: number, probabilityOneBeatTwo: number, KullbackLeibler: number): TestResult => ({
    ABTestBeginning: abTestBeginning,
    WorkspaceA: workspaceAData.Workspace,
    WorkspaceB: workspaceBData.Workspace,
    Winner: winner,
    ExpectedLossChoosingA: lossA,
    ConversionA: workspaceAData.OrderSessions / workspaceAData.Sessions,
    ExpectedLossChoosingB: lossB,
    ConversionB: workspaceBData.OrderSessions / workspaceBData.Sessions,
    ProbabilityAlternativeBeatMaster: probabilityOneBeatTwo,
    KullbackLeibler: KullbackLeibler
})