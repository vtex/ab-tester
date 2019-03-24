export const InitialABTestParameters: ABTestParameters = { "a": 1, "b": 1 }
export const DefaultABTestParameters: ABTestParameters = { "a": 0, "b": 0 }

export function InitialWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    let abWorkspaceMetadata: ABWorkspaceMetadata = {
        name: Workspace.name,
        weight: Workspace.weight,
        abTestParameters: InitialABTestParameters,
        production: Workspace.production
    }
    return abWorkspaceMetadata
}

export function DefaultWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    let abWorkspaceMetadata: ABWorkspaceMetadata = {
        name: Workspace.name,
        weight: Workspace.weight,
        abTestParameters: DefaultABTestParameters,
        production: Workspace.production
    }
    return abWorkspaceMetadata
}