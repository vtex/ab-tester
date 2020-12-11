import { ProbabilityYBeatsAll } from '../utils/mathTools/decisionRule/bayesianConversion'
import { CalculateUValue } from '../utils/mathTools/decisionRule/frequentistRevenue'
import { InitialABTestProportion, WorkspaceToBetaDistribution } from '../utils/workspace'

const MasterWorkspaceName = 'master'

interface TestingProportions {
    Get(): Map<string, proportion>;

    Add(workspaceName: string, proportion?: proportion): void;

    Remove(workspaceName: string): void;

    UpdateWithFixedProportions(masterProportion: number): void;
}

interface ITestingProportions extends TestingProportions{
    Update(workspacesData: Map<string, WorkspaceData>): void;
}

class GenericTestingProportions implements TestingProportions {
    protected proportions: Map<string, proportion>

    constructor(testingWorkspaces: ABTestWorkspace[]) {
        const proportions = testingWorkspaces !== null ? MapInitialProportion(testingWorkspaces) : new Map()
        this.proportions = new Map(proportions)
    }

    public Get = (): Map<string, proportion> => {
        return this.proportions
    }

    public Add = (workspaceName: string, proportion: proportion = InitialABTestProportion) => {
        this.proportions.set(workspaceName, proportion)
    }

    public Remove = (workspaceName: string) => {
        this.proportions.delete(workspaceName)
    }

    public UpdateWithFixedProportions = (masterProportion: number) => {
        const size = this.proportions.size
        const nonMasterProportion = (10000 - masterProportion) / (size - 1)

        for (const workspace of this.proportions.keys()) {
            const proportion = workspace === MasterWorkspaceName ? masterProportion : nonMasterProportion
            this.proportions.set(workspace, proportion)
        }
    }
}

class TestingProportionsBayesianConversion extends GenericTestingProportions implements ITestingProportions {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super (testingWorkspaces)
    }

    public Update = (workspacesData: Map<string, WorkspaceData>) => {
        const names = Array<string>(0)
        const betaParams = Array<BetaParameters>(0)

        for (const workspace of this.proportions.keys()) {
            if (workspacesData.has(workspace)) {
                names.push(workspace)
                betaParams.push(WorkspaceToBetaDistribution(workspacesData.get(workspace)!))
            }
        }

        const size = betaParams.length
        for (let i = 0; i < size; i++) {
            const y = betaParams.shift()!
            this.proportions.set(names.shift()!, ProbabilityYBeatsAll(y, betaParams))
            betaParams.push(y)
        }
    }
}

class TestingProportionsFrequentistRevenue extends GenericTestingProportions implements ITestingProportions {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super(testingWorkspaces)
    }
    // the proportion of traffic to each workspace is updated using the U value of the Mann Whitney U-test
    // this value is approximately the chance of one workspace being stochastically greater than another
    public Update(workspacesData: Map<string, WorkspaceData>) {
        const testData: MannWhitneyTestData = {workspaceNames: [], OrdersValueHistory: [], U: []}

        for (const workspaceName of this.proportions.keys()) {
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
            this.proportions.set(testData.workspaceNames[i], Math.round(10000*testData.U[i]/sum))
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

const testingProportionsClasses = {
    "frequentist": {
        "conversion": TestingProportionsBayesianConversion, // Provisional, while we don't have all TestingProportions classes implemented
        "revenue": TestingProportionsFrequentistRevenue
    },
    "bayesian": {
        "conversion": TestingProportionsBayesianConversion,
        "revenue": TestingProportionsFrequentistRevenue // Provisional, while we don't have all TestingProportions classes implemented
    }
}

export const createGenericTestingProportions = (TestingWorkspaces: ABTestWorkspace[]): GenericTestingProportions => {
    return new GenericTestingProportions(TestingWorkspaces)
}

export const createTestingProportions = (testType: TestType, testApproach: TestApproach, testingWorkspaces: ABTestWorkspace[]): ITestingProportions => {
    return new testingProportionsClasses[testApproach][testType](testingWorkspaces)
}