export const InitialABTestParameters: ABTestParameters = { a: 1, b: 1 }
export const DefaultABTestParameters: ABTestParameters = { a: 0, b: 0 }

export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): ABTestParameters => ({
    a: Workspace.OrderSessions + 1,
    b: Workspace.NoOrderSessions + 1,
})

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number): WorkspaceData => ({
    Conversion: (TotalSessions > 0 ? OrderSessions / TotalSessions : 0),
    NoOrderSessions: (TotalSessions - OrderSessions),
    OrderSessions: (OrderSessions),
    Sessions: TotalSessions,
    Workspace: `${Workspace}`,
})

const ErrorWorkspaceData = (workspace: string): WorkspaceData => ({
    Conversion: 0,
    NoOrderSessions: 0,
    OrderSessions: 0,
    Sessions: 0,
    Workspace: workspace,
})

const ErrorWorkspaceCompleteData = (workspace: string): WorkspaceCompleteData => ({
    Last24Hours: ErrorWorkspaceData(workspace),
    SinceBeginning: ErrorWorkspaceData(workspace),
})

export const FilteredWorkspacesData = (workspacesData: WorkspaceData[], testingWorkspaces: string[]): WorkspaceData[] => {
    const filteredWorkspaces: WorkspaceData[] = []
    for (const workspaceData of workspacesData) {
        if (testingWorkspaces.includes(workspaceData.Workspace)) {
            filteredWorkspaces.push(workspaceData)
        }
    }
    return filteredWorkspaces
}

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

export function MinimumABTestParameter(workspace: ABWorkspaceMetadata) {
    const params = workspace.abTestParameters || DefaultABTestParameters
    return Math.min(params.a, params.b)
}

export const totalSessions = (workspacesData: WorkspaceData[]): number => {
    let total = 0
    for(const workspaceData of workspacesData) {
        total += workspaceData.Sessions
    }
    return total
}

export function GetWorkspaceData(workspacesData: WorkspaceData[], workspace: string): WorkspaceData {
    if (workspacesData === null) {
        return ErrorWorkspaceData(workspace)
    }
    for (const workspaceData of workspacesData) {
        if (workspaceData.Workspace === workspace) {
            return workspaceData
        }
    }
    return ErrorWorkspaceData(workspace)
}

export function GetWorkspaceCompleteData(workspacesData: WorkspaceCompleteData[], workspace: string): WorkspaceCompleteData {
    if (workspacesData === null) {
        return ErrorWorkspaceCompleteData(workspace)
    }
    for (const workspaceData of workspacesData) {
        if (workspaceData.SinceBeginning.Workspace === workspace) {
            return workspaceData
        }
    }
    return ErrorWorkspaceCompleteData(workspace)
}

export const ToWorkspaceMetadada = (workspaceData: WorkspaceData, weight: number, production: boolean): ABWorkspaceMetadata => {
    return {
        abTestParameters: ToABTestParameters(workspaceData),
        name: workspaceData.Workspace,
        production: (production),
        weight: (weight),
    }
}

const ToABTestParameters = (workspaceData: WorkspaceData): ABTestParameters => {
    return {
        a: workspaceData.OrderSessions + 1,
        b: workspaceData.NoOrderSessions + 1,
    }
}