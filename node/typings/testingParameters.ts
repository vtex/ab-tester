import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'

export default class TestingParameters {
    private parameters: Map<string, Workspace>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const parameters = testingWorkspaces !== null ? MapInitialParameters(testingWorkspaces) : new Map()
        this.parameters = new Map(parameters)
    }

    public Get = (): Map<string, Workspace> => {
        return this.parameters
    }

    public ToArray = (): Workspace[] => {
        return UnmapParameters(this.parameters)
    }

    public Includes = (workspaceName: string): boolean => {
        return this.parameters.has(workspaceName)
    }

    public Set = (workspacesData: Map<string, WorkspaceData>) => {
        for (const workspace of this.parameters.keys()) {
            if (workspacesData.has(workspace)) {
                this.parameters.set(workspace, {
                    abTestParameters: WorkspaceToBetaDistribution(workspacesData.get(workspace)!),
                    name: (workspace),
                    production: true,
                    weight: 100,
                })
            }
        }
    }
}

const MapInitialParameters = (workspaces: ABTestWorkspace[]): Map<string, Workspace> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, {
            abTestParameters: InitialABTestParameters,
            name: workspace.name,
            production: true,
            weight: 100,
        })
    }
    return map
}
const UnmapParameters = (mapParameters: Map<string, Workspace>): Workspace[] => {
    const parameters: Workspace[] = []
    for (const parameter of mapParameters.values()) {
        parameters.push(parameter)
    }
    return parameters
}

declare global {
    export interface Workspace {
        name: string,
        production: boolean,
        weight: number,
        abTestParameters: ABTestParameters,
    }
}