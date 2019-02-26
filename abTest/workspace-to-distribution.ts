export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): BetaDistribution => ({
    parameterA: Workspace["OrderSessions"],
    parameterB: Workspace["NoOrderSessions"]
})