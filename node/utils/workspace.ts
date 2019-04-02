export const InitialABTestParameters: ABTestParameters = { a: 1, b: 1 }
export const DefaultABTestParameters: ABTestParameters = { a: 0, b: 0 }

export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): ABTestParameters => ({
    a: Workspace.OrderSessions + 1,
    b: Workspace.NoOrderSessions + 1,
})

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number): WorkspaceData => ({
    Workspace: Workspace,
    Sessions: TotalSessions,
    OrderSessions: OrderSessions,
    NoOrderSessions: (TotalSessions - OrderSessions),
})

export function InitialWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    const abWorkspaceMetadata: ABWorkspaceMetadata = {
        name: Workspace.name,
        weight: Workspace.weight,
        abTestParameters: InitialABTestParameters,
        production: Workspace.production,
    }
    return abWorkspaceMetadata
}

export function DefaultWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    const abWorkspaceMetadata: ABWorkspaceMetadata = {
        name: Workspace.name,
        weight: Workspace.weight,
        abTestParameters: DefaultABTestParameters,
        production: Workspace.production,
    }
    return abWorkspaceMetadata
}

export function GetWorkspaceData(workspacesData: WorkspaceData[], workspace: string): WorkspaceData {
    for (const workspaceData of workspacesData) {
        if (workspaceData.Workspace === workspace) {
            return workspaceData
        }
    }
    return {
        Workspace: workspace,
        Sessions: 0,
        OrderSessions: 0,
        NoOrderSessions: 0,
    }
}