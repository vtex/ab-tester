export const DefaultEvaluationResponse = (abTestBeginning: string, workspaceAName: string, workspaceBName: string): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: 0,
    ConversionB: 0,
    ExpectedLossChoosingA: 0,
    ExpectedLossChoosingB: 0,
    KullbackLeibler: 0,
    ProbabilityAlternativeBeatMaster: 0,
    Winner: 'Not yet decided',
    WorkspaceA: workspaceAName,
    WorkspaceASessions: 0,
    WorkspaceB: workspaceBName,
    WorkspaceBSessions: 0,
})

export const EvaluationResponse = (abTestBeginning: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, winner: string, lossA: number, lossB: number, probabilityOneBeatTwo: number, KullbackLeibler: number): TestResult => ({
    ABTestBeginning: abTestBeginning,
    ConversionA: workspaceAData.OrderSessions / workspaceAData.Sessions,
    ConversionB: workspaceBData.OrderSessions / workspaceBData.Sessions,
    ExpectedLossChoosingA: lossA,
    ExpectedLossChoosingB: lossB,
    KullbackLeibler: (KullbackLeibler),
    ProbabilityAlternativeBeatMaster: probabilityOneBeatTwo,
    Winner: winner,
    WorkspaceA: workspaceAData.Workspace,
    WorkspaceASessions: workspaceAData.Sessions,
    WorkspaceB: workspaceBData.Workspace,
    WorkspaceBSessions: workspaceBData.Sessions,
})