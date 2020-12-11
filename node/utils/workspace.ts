export const InitialABTestProportion: proportion = 1

export const WorkspaceToBetaDistribution = (Workspace: WorkspaceData): BetaParameters => ({
    a: Workspace.OrderSessions + 1,
    b: Workspace.NoOrderSessions + 1,
})

export const WorkspaceToBayesRevParameters = (Workspace: WorkspaceData): BayesianRevenueParams => ({
    ...WorkspaceToBetaDistribution(Workspace),
    r: Workspace.OrdersValue / Workspace.OrderSessions
})

export const WorkspaceData = (Workspace: string, TotalSessions: number, OrderSessions: number, OrdersValue: number): WorkspaceData => ({
    Conversion: (TotalSessions > 0 ? OrderSessions / TotalSessions : 0),
    NoOrderSessions: (TotalSessions - OrderSessions),
    OrderSessions: (OrderSessions),
    Sessions: TotalSessions,
    Workspace: `${Workspace}`,
    OrdersValue: (OrdersValue),
    OrdersValueHistory: []
})

const ErrorWorkspaceData = (workspace: string): WorkspaceData => ({
    Conversion: 0,
    NoOrderSessions: 0,
    OrderSessions: 0,
    Sessions: 0,
    Workspace: workspace,
    OrdersValue: 0,
    OrdersValueHistory: [],
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

export const MapWorkspaceData = (workspacesData: WorkspaceData[]): Map<string, WorkspaceData> => {
    const map = new Map()
    for(const workspaceData of workspacesData) {
        map.set(workspaceData.Workspace, workspaceData)
    }
    return map
}

export const MapInitialProportion = (workspaces: ABTestWorkspace[]): Map<string, proportion> => {
    const proportions = new Map<string, proportion>()
    for (const workspace of workspaces) {
        proportions.set(workspace.name, InitialABTestProportion)
    }
    return proportions
}

// Return only the workspaces of positive revenue
export function positiveRevenueWorkspaces(workspaces: BayesianRevenueParams[]): BayesianRevenueParams[] {
    return workspaces.filter(workspace => workspace.r > 0)
}