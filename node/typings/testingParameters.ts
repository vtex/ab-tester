import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'

export default class TestingParameters {
    private parameters: Map<string, ABTestParametersMetadata>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const parameters = testingWorkspaces !== null ? MapInitialParameters(testingWorkspaces) : new Map()
        this.parameters = new Map(parameters)
    }

    public ToArray = (): ABTestParametersMetadata[] => {
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
                    workspace: (workspace),
                })
            }
        }
    }
}

const MapInitialParameters = (workspaces: ABTestWorkspace[]): Map<string, ABTestParametersMetadata> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, {
            abTestParameters: InitialABTestParameters,
            workspace: workspace.name,
        })
    }
    return map
}
const UnmapParameters = (mapParameters: Map<string, ABTestParametersMetadata>): ABTestParametersMetadata[] => {
    const parameters: ABTestParametersMetadata[] = []
    for (const parameter of mapParameters.values()) {
        parameters.push(parameter)
    }
    return parameters
}

declare global {
    export interface ABTestParametersMetadata {
        workspace: string,
        abTestParameters: ABTestParameters,
    }
}