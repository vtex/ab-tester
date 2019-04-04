export const InitialABTestParameters: ABTestParameters = { a: 1, b: 1 }
export const DefaultABTestParameters: ABTestParameters = { a: 0, b: 0 }

export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): ABTestParameters => ({
    a: Workspace.OrderSessions + 1,
    b: Workspace.NoOrderSessions + 1,
})

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number): WorkspaceData => ({
    NoOrderSessions: (TotalSessions - OrderSessions),
    OrderSessions: (OrderSessions),
    Sessions: TotalSessions,
    Workspace: `${Workspace}`,
})

export function InitialWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    const abWorkspaceMetadata: ABWorkspaceMetadata = {
        abTestParameters: InitialABTestParameters,
        name: Workspace.name,
        production: Workspace.production,
        weight: Workspace.weight,
    }
    return abWorkspaceMetadata
}

export function DefaultWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    const abWorkspaceMetadata: ABWorkspaceMetadata = {
        abTestParameters: DefaultABTestParameters,
        name: Workspace.name,
        production: Workspace.production,
        weight: Workspace.weight,
    }
    return abWorkspaceMetadata
}

export function GetWorkspaceData(workspacesData: WorkspaceData[], workspace: string): WorkspaceData {
    if (workspacesData === null) {
        return {
            NoOrderSessions: 0,
            OrderSessions: 0,
            Sessions: 0,
            Workspace: workspace,
        }
    }
    for (const workspaceData of workspacesData) {
        if (workspaceData.Workspace === workspace) {
            return workspaceData
        }
    }
    return {
        NoOrderSessions: 0,
        OrderSessions: 0,
        Sessions: 0,
        Workspace: workspace,
    }
}