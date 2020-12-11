import { ProbabilityYBeatsAll } from '../utils/mathTools/decisionRule/bayesianConversion'
import { CalculateUValue } from '../utils/mathTools/decisionRule/frequentistRevenue'
import { InitialABTestProportion, WorkspaceToBetaDistribution } from '../utils/workspace'

const MasterWorkspaceName = 'master'

interface TestingParameters {
    Get(): Map<string, proportion>;

    Add(workspaceName: string, proportion?: proportion): void;

    Remove(workspaceName: string): void;

    UpdateWithFixedParameters(masterProportion: number): void;
}

interface ITestingParameters extends TestingParameters{
    Update(workspacesData: Map<string, WorkspaceData>): void;
}

class GenericTestingParameters implements TestingParameters {
    protected parameters: Map<string, proportion>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const parameters = testingWorkspaces !== null ? MapInitialProportion(testingWorkspaces) : new Map()
        this.parameters = new Map(parameters)
    }

    public Get = (): Map<string, proportion> => {
        return this.parameters
    }

    public Add = (workspaceName: string, proportion: proportion = InitialABTestProportion) => {
        this.parameters.set(workspaceName, proportion)
    }

    public Remove = (workspaceName: string) => {
        this.parameters.delete(workspaceName)
    }

    public UpdateWithFixedParameters = (masterProportion: number) => {
        const size = this.parameters.size
        const nonMasterParameter = (10000 - masterProportion) / (size - 1)

        for (const workspace of this.parameters.keys()) {
            const proportion = workspace === MasterWorkspaceName ? masterProportion : nonMasterParameter
            this.parameters.set(workspace, proportion)
        }
    }
}

class TestingParametersBayesianConversion extends GenericTestingParameters implements ITestingParameters {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super (testingWorkspaces)
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
}

class TestingParametersFrequentistRevenue extends GenericTestingParameters implements ITestingParameters {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super(testingWorkspaces)
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
            this.parameters.set(testData.workspaceNames[i], Math.round(10000*testData.U[i]/sum))
        }
    }
}

interface MannWhitneyTestData {
    workspaceNames: string[],
    OrdersValueHistory: number[][],
    U: number[],

}

const MapInitialProportion = (workspaces: ABTestWorkspace[]): Map<string, proportion> => {
    const map = new Map()
    for (const workspace of workspaces) {
        map.set(workspace.name, InitialABTestProportion)
    }
    return map
}

const testingParametersClasses = {
    "frequentist": {
        "conversion": TestingParametersBayesianConversion, // Provisional, while we don't have all TestingParameters classes implemented
        "revenue": TestingParametersFrequentistRevenue
    },
    "bayesian": {
        "conversion": TestingParametersBayesianConversion,
        "revenue": TestingParametersFrequentistRevenue // Provisional, while we don't have all TestingParameters classes implemented
    }
}

export const createGenericTestingParameters = (TestingWorkspaces: ABTestWorkspace[]): GenericTestingParameters => {
    return new GenericTestingParameters(TestingWorkspaces)
}

export const createTestingParameters = (testType: TestType, testApproach: TestApproach, testingWorkspaces: ABTestWorkspace[]): ITestingParameters => {
    return new testingParametersClasses[testApproach][testType](testingWorkspaces)
}