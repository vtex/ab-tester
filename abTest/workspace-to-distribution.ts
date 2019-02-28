export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): BetaDistribution => ({
    parameterA: Workspace["OrderSessions"] + 1,
    parameterB: Workspace["NoOrderSessions"] + 1
})