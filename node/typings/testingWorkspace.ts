export default class TestingWorkspaces {
    private workspaces: Map<string, ABTestWorkspace>

    constructor(metaData: ABTestWorkspacesMetadata) {
        const hasWorkspaces = (metaData !== null) && (metaData.workspaces !== null)
        const workspaces = hasWorkspaces ? MapInitialWorkspaces(metaData.workspaces) : new Map()
        this.workspaces = new Map(workspaces)
    }

    public ToArray = (): ABTestWorkspace[] => {
        return UnmapWorkspaces(this.workspaces)
    }

    public Includes = (workspaceName: string): boolean => {
        return this.workspaces.has(workspaceName)
    }
    public Length = (): number => {
        return this.workspaces.size
    }

    public Add = (workspaceName: string) => {
        this.workspaces.set(workspaceName, { name: workspaceName })
    }
    public Remove = (workspaceName: string) => {
        this.workspaces.delete(workspaceName)
    }

    public WorkspacesNames = (): string[] => {
        const workspacesNames = []
        for (const testingWorkspace of this.workspaces.keys()) {
            workspacesNames.push(testingWorkspace)
        }
        return workspacesNames
    }
}

const MapInitialWorkspaces = (workspaces: ABTestWorkspace[]): Map<string, ABTestWorkspace> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, workspace)
    }
    return map
}
const UnmapWorkspaces = (mapWorkspaces: Map<string, ABTestWorkspace>): ABTestWorkspace[] => {
    const workspaces: ABTestWorkspace[] = []
    for (const workspace of mapWorkspaces.values()) {
        workspaces.push(workspace)
    }
    return workspaces
}

declare global {
    export interface ABTestWorkspace {
        name: string,
    }
    export interface ABTestWorkspacesMetadata {
        Id: string,
        workspaces: ABTestWorkspace[]
    }
}