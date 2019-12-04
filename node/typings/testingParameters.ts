import { ProbabilityYBeatsAll } from '../utils/mathTools/forBetaDistribution/decisionRule'
import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'
import { TestType } from '../clients/vbase'

const MasterWorkspaceName = 'master'

export interface ITestingParameters {
    Get(): Map<string, ABTestParameters>;

    Add(workspaceName: string): void;

    Remove(workspaceName: string): void;

    Update(workspacesData: Map<string, WorkspaceData>): void;

    UpdateWithFixedParameters(proportion: number): void;
}

export class TestingParametersConversion implements ITestingParameters{
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

    public Update = (workspacesData: Map<string, WorkspaceData>) => {
        const names = Array<string>(0)
        const betaParams = Array<ABTestParameters>(0)

        for (const workspace of this.parameters.keys()) {
            if (workspacesData.has(workspace)) {
                names.push(workspace)
                betaParams.push(WorkspaceToBetaDistribution(workspacesData.get(workspace)!))
            }
        }

        const size = betaParams.length
        for (let i = 0; i < size; i++) {
            const y = betaParams.shift()!
            this.parameters.set(names.shift()!, ProbabilityYBeatsAll(y, betaParams))
            betaParams.push(y)
        }
    }

    public UpdateWithFixedParameters = (proportion: number) => {
        const actualProportion = proportion >= 0 && proportion <= 10000 ? proportion : 10000
        const size = this.parameters.size
        const nonMasterParameter = (10000 - actualProportion) / (size - 1)

        for (const workspace of this.parameters.keys()) {
            const parameter = workspace === MasterWorkspaceName ? actualProportion : nonMasterParameter
            this.parameters.set(workspace, { a: parameter, b: 1 })
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
export const createTestingParameters = (testType: TestType, testingWorkspaces: ABTestWorkspace[]): ITestingParameters => {
    if (testType == TestType.conversion) {
        return new TestingParametersConversion(testingWorkspaces)
    }
    return new TestingParametersConversion(testingWorkspaces)
}

declare global {
    export interface Workspace {
        name: string,
        production: boolean,
        weight: number,
        abTestParameters: ABTestParameters,
    }
}