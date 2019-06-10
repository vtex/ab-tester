export const MapWorkspaceData = (workspacesData: WorkspaceData[]): Map<string, WorkspaceData> => {
    const map = new Map()
    for(const workspaceData of workspacesData) {
        map.set(workspaceData.Workspace, workspaceData)
    }
    return map
}