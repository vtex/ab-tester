import { ProbabilityYBeatsAll } from '../utils/mathTools/decisionRule/forBetaDistribution'
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
            const U = this.CalculateUValue(testData.OrdersValueHistory, i)
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

    //for a brief introduction on test being used and U values, check: https://en.wikipedia.org/wiki/Mann–Whitney_U_test
    private CalculateUValue(OrdersValueHistory: number[][], idx: number) {
        const valuesAndLabels = this.CreateOrdersValueHistoryWithLabels(OrdersValueHistory, idx)
        let iterator = 0
        let U = 0
        while(iterator < valuesAndLabels.length) {
            let countIdx = 0
            let countTotal = 0
            let repetitions = iterator
            while (repetitions < valuesAndLabels.length && valuesAndLabels[repetitions][0] == valuesAndLabels[iterator][0]) {
                if (valuesAndLabels[repetitions][1] == 0) {
                    countIdx++
                }
                countTotal++
                repetitions++
            }
            let avg = (2 * iterator + countTotal + 1) /2.0
            U += avg * countIdx
            iterator = repetitions
        }
        U -= OrdersValueHistory[idx].length * (OrdersValueHistory[idx].length + 1) / 2.0
        return U
    }

    private CreateOrdersValueHistoryWithLabels(OrdersValueHistory: number[][], idx: number) {
        let valuesAndLabels: Array<[number, number]> = []
        for (const value of OrdersValueHistory[idx]) {
            valuesAndLabels.push([value, 0])
        }
        for (let i = 0; i < OrdersValueHistory.length; i++) {
            if (i != idx) {
                for (const value of OrdersValueHistory[i]) {
                    valuesAndLabels.push([value, 1])
                }
            }
        }
        valuesAndLabels = valuesAndLabels.sort((a, b) => b[0] - a[0])
        return valuesAndLabels
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