import { ProbabilityYBeatsAll } from '../utils/mathTools/decisionRule/forBetaDistribution'
import { CalculateUValue } from '../utils/mathTools/decisionRule/forMannWhitney'
import { InitialABTestParameters, WorkspaceToBetaDistribution } from '../utils/workspace'

const MasterWorkspaceName = 'master'

interface ITestingParameters {
    Get(): Map<string, ABTestParameters>;

    Add(workspaceName: string): void;

    Remove(workspaceName: string): void;

    Update(workspacesData: Map<string, WorkspaceData>): void;

    UpdateWithFixedParameters(proportion: number): void;
}

class TestingParametersConversion implements ITestingParameters{
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
        const size = this.parameters.size
        const nonMasterParameter = (10000 - proportion) / (size - 1)

        for (const workspace of this.parameters.keys()) {
            const parameter = workspace === MasterWorkspaceName ? proportion : nonMasterParameter
            this.parameters.set(workspace, { a: Math.round(parameter), b: 1 })
        }
    }
}

class TestingParametersRevenue implements ITestingParameters{
    private parameters: Map<string, ABTestParameters>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const parameters = testingWorkspaces !== null ? MapInitialParameters(testingWorkspaces) : new Map()
        this.parameters = new Map(parameters)
    }

    public Get = (): Map<string, ABTestParameters> => {
        return this.parameters
    }

    public Add = (workspaceName: string, abTestParameter: ABTestParameters = InitialABTestParameters) => {
        this.parameters.set(workspaceName, abTestParameter)
    }

    public Remove = (workspaceName: string) => {
        this.parameters.delete(workspaceName)
    }


    // the proportion of traffic to each workspace is updated using the U value of the Mann Whitney U-test
    // this value is approximately the chance of one workspace being stochastically greater than another
    public Update(workspacesData: Map<string, WorkspaceData>) {
        const testData: MannWhitneyTestData = {workspaceNames: [], OrdersValueHistory: [], U: []}

        for (const workspaceName of this.parameters.keys()) {
            if (workspacesData.has(workspaceName)) {
                testData.workspaceNames.push(workspaceName)
                testData.OrdersValueHistory.push(workspacesData.get(workspaceName)!.OrdersValueHistory!)
            }
        }
        
        const size = testData.workspaceNames.length
        let sum = 0
        for (let i = 0; i < size; i++) {
            const U = CalculateUValue(testData.OrdersValueHistory, i)
            testData.U.push(U)
            sum += U
        }
        for (let i = 0; i < size; i++) {
            this.parameters.set(testData.workspaceNames[i], { a: Math.round(10000*testData.U[i]/sum), b: 0 })
        }
    }

    public UpdateWithFixedParameters = (proportion: number) => {
        const size = this.parameters.size
        const nonMasterParameter = (10000 - proportion) / (size - 1)

        for (const workspace of this.parameters.keys()) {
            const parameter = workspace === MasterWorkspaceName ? proportion : nonMasterParameter
            this.parameters.set(workspace, { a: Math.round(parameter), b: 1 })
        }
    }
}

interface MannWhitneyTestData {
    workspaceNames: string[],
    OrdersValueHistory: number[][],
    U: number[],

}

const MapInitialParameters = (workspaces: ABTestWorkspace[]): Map<string, ABTestParameters> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, InitialABTestParameters)
    }
    return map
}
export const createTestingParameters = (testType: TestType, testingWorkspaces: ABTestWorkspace[]): ITestingParameters => {
    if (testType === 'conversion') {
        return new TestingParametersConversion(testingWorkspaces)
    }
    if (testType === 'revenue') {
        return new TestingParametersRevenue(testingWorkspaces)
    }
    return new TestingParametersConversion(testingWorkspaces)
}