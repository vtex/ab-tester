import { TSMap } from 'typescript-map'

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

export const totalSessions = (workspacesData: WorkspaceData[]): number => {
    let total = 0
    for (const workspaceData of workspacesData) {
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

export const ToWorkspaceMetadada = (workspaceData: WorkspaceData, weight: number, production: boolean): ABWorkspaceMetadata => {
    return {
        abTestParameters: WorkspaceToBetaDistribution(workspaceData),
        name: workspaceData.Workspace,
        production: (production),
        weight: (weight),
    }
}

export const InitialParameters = (workspaces: ABTestWorkspace[]): TSMap<string, Workspace> => {
    const parameters = new TSMap<string, Workspace>()
    for (const workspace of workspaces) {
        parameters.set(workspace.name, {
            abTestParameters: InitialABTestParameters,
            name: (workspace.name),
            production: true,
            weight: 100,
        })
    }
    return parameters
}