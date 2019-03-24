export function GetWorkspaceData(workspacesData: WorkspaceData[], workspace: string): WorkspaceData {
    for (var workspaceData of workspacesData) {
        if (workspaceData.Workspace == workspace) {
            return workspaceData
        }
    }
}