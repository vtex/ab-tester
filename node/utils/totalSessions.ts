export const totalSessions = (workspacesData: WorkspaceData[]): number => {
    let total = 0
    for(const workspaceData of workspacesData) {
        total += workspaceData.Sessions
    }
    return total
}