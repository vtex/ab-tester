import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'
import { ProbabilityYBeatsAll } from '../utils/mathTools/forBetaDistribution/decisionRule'

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
        let names = Array<string>(0)
        let betaParams = Array<ABTestParameters>(0)
        for (const workspace of this.parameters.keys()) {
            if (workspacesData.has(workspace)) {
                names.push(workspace)
                betaParams.push(WorkspaceToBetaDistribution(workspacesData.get(workspace)!))
            }
        }
        for (let i = 0; i < betaParams.length; i++) {
            let y = betaParams.shift()!
            this.parameters.set(names.shift()!, ProbabilityYBeatsAll(y, betaParams))
            betaParams.push(y)
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