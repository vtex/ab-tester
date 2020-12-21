import { DefaultResponseBayesianConversion } from '../../../utils/evaluation-response/default'
import { EvaluationResponseBayesianConversion } from '../../../utils/evaluation-response/evaluation'
import { ChooseWinner, LossFunctionChoosingVariantOne, ProbabilityOfOneBeatsTwo } from '../../../utils/mathTools/decisionRule/bayesianConversion'
import { WorkspaceToBetaDistribution } from '../../../utils/workspace'

export function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): BayesianEvaluationResultConversion {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultResponseBayesianConversion(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }

    const betaDistributionA = WorkspaceToBetaDistribution(workspaceAData.SinceBeginning)
    const betaDistributionB = WorkspaceToBetaDistribution(workspaceBData.SinceBeginning)
    const lossA = LossFunctionChoosingVariantOne(betaDistributionA, betaDistributionB)
    const lossB = LossFunctionChoosingVariantOne(betaDistributionB, betaDistributionA)
    const probabilityAbeatsB = ProbabilityOfOneBeatsTwo(betaDistributionA.a, betaDistributionA.b, betaDistributionB.a, betaDistributionB.b)
    const winner = ChooseWinner(workspaceAData.SinceBeginning, workspaceBData.SinceBeginning)

    return EvaluationResponseBayesianConversion(abTestBeginning, workspaceAData, workspaceBData, winner, probabilityAbeatsB, lossA, lossB)
}

export function Winner(testResult: TestResult): string {
    const results = testResult as BayesianEvaluationResultConversion[]

    if (!results || results.length === 0) return 'master'

    if (results[0].ExpectedLossChoosingA < results[0].ExpectedLossChoosingB) {
        results.shift()
        return Winner(results)
    }

    let winner = results[0].WorkspaceB
    let loss = results[0].ExpectedLossChoosingB

    for (let i = 1; i < results.length; i++) {
        if (results[i].ExpectedLossChoosingB < loss) {
            winner = results[i].WorkspaceB
            loss = results[i].ExpectedLossChoosingB
        }
    }
    return winner
}