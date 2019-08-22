import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'

export default class TestingParameters {
    private parameters: Map<string, ABTestParameters>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const parameters = testingWorkspaces !== null ? MapInitialParameters(testingWorkspaces) : new Map()
        this.parameters = new Map(parameters)
    }

    public Get = (): Map<string, ABTestParameters> => {
        return this.parameters
    }

    public Add = (workspaceName: string, abTestParameter = InitialABTestParameters) => {
        this.parameters.set(workspaceName, abTestParameter)
    }

    public Remove = (workspaceName: string) => {
        this.parameters.delete(workspaceName)
    }

    public ToArray = (): ABTestParameters[] => {
        return UnmapParameters(this.parameters)
    }

    public Includes = (workspaceName: string): boolean => {
        return this.parameters.has(workspaceName)
    }

    public Set = (workspacesData: Map<string, WorkspaceData>) => {
        for (const workspace of this.parameters.keys()) {
            if (workspacesData.has(workspace)) {
                this.parameters.set(workspace, WorkspaceToBetaDistribution(workspacesData.get(workspace)!))
            }
        }
    }
}

const MapInitialParameters = (workspaces: ABTestWorkspace[]): Map<string, ABTestParameters> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, InitialABTestParameters)
    }
    return map
}
const UnmapParameters = (mapParameters: Map<string, ABTestParameters>): ABTestParameters[] => {
    const parameters: ABTestParameters[] = []
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