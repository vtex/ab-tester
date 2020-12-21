import { ProbabilityYBeatsAll } from '../utils/mathTools/decisionRule/bayesianConversion'
import { ProbabilityXIsBest as BayesProbabilityXIsBest } from '../utils/mathTools/decisionRule/bayesianRevenue'
import { ProbabilityXIsBest as FreqProbabilityXIsBest } from '../utils/mathTools/decisionRule/frequentist'
import { MapInitialProportion, InitialABTestProportion, WorkspaceToBetaDistribution, WorkspaceToBayesRevParameters, RevenueToNormalDistribution } from '../utils/workspace'

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

class TestingProportionsFrequentistRevenue extends GenericTestingProportions implements ITestingProportions {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super(testingWorkspaces)
    }

    public Update(workspacesData: Map<string, WorkspaceData>) {
        const names = Array<string>(0)
        const params = Array<NormalDistribution>(0)

        for (const workspace of this.proportions.keys()) {
            if (workspacesData.has(workspace)) {
                names.push(workspace)
                params.push(RevenueToNormalDistribution(workspacesData.get(workspace)!))
            }
        }

        for (const _idx in names) {
            const X = params.shift()!
            this.proportions.set(names.shift()!, Math.round(10000*FreqProbabilityXIsBest(X, params)))
            params.push(X)
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

class TestingProportionsBayesianRevenue extends GenericTestingProportions implements ITestingProportions {
    constructor(testingWorkspaces: ABTestWorkspace[]) {
        super (testingWorkspaces)
    }

    public Update = (workspacesData: Map<string, WorkspaceData>) => {
        const names = Array<string>(0)
        const params = Array<BayesianRevenueParams>(0)

        for (const workspace of this.proportions.keys()) {
            if (workspacesData.has(workspace)) {
                names.push(workspace)
                params.push(WorkspaceToBayesRevParameters(workspacesData.get(workspace)!))
            }
        }

        for (const _idx in names) {
            const X = params.shift()!
            this.proportions.set(names.shift()!, Math.round(10000*BayesProbabilityXIsBest(X, params) + 1))
            params.push(X)
        }
    }
}

const testingProportionsClasses = {
    "frequentist": {
        "conversion": TestingProportionsBayesianConversion, // Provisional, while we don't have all TestingProportions classes implemented
        "revenue": TestingProportionsFrequentistRevenue
    },
    "bayesian": {
        "conversion": TestingProportionsBayesianConversion,
        "revenue": TestingProportionsBayesianRevenue
    }
}

export const createGenericTestingProportions = (TestingWorkspaces: ABTestWorkspace[]): GenericTestingProportions => {
    return new GenericTestingProportions(TestingWorkspaces)
}

export const createTestingProportions = (testType: TestType, testApproach: TestApproach, testingWorkspaces: ABTestWorkspace[]): ITestingProportions => {
    return new testingProportionsClasses[testApproach][testType](testingWorkspaces)
}