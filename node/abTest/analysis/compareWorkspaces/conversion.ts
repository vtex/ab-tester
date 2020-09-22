import { DefaultEvaluationResponseConversion, EvaluationResponseConversion } from '../../../utils/evaluation-response'
import { ChooseWinner, LossFunctionChoosingVariantOne, ProbabilityOfOneBeatsTwo } from '../../../utils/mathTools/forBetaDistribution/decisionRule'
import { BoundError, pValue } from '../../../utils/mathTools/statistics/samplesRestrictions'
import { WorkspaceToBetaDistribution } from '../../../utils/workspace'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultEvaluationResponseConversion(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }

    const betaDistributionA = WorkspaceToBetaDistribution(workspaceAData.SinceBeginning)
    const betaDistributionB = WorkspaceToBetaDistribution(workspaceBData.SinceBeginning)
    const lossA = LossFunctionChoosingVariantOne(betaDistributionA, betaDistributionB)
    const lossB = LossFunctionChoosingVariantOne(betaDistributionB, betaDistributionA)
    const probabilityTwoBeatsOne = ProbabilityOfOneBeatsTwo(betaDistributionB.a, betaDistributionB.b, betaDistributionA.a, betaDistributionA.b)
    const statiscs = pValue(betaDistributionA, betaDistributionB)
    const winner = ChooseWinner(workspaceAData.SinceBeginning, workspaceBData.SinceBeginning, BoundError) || 'Not yet decided'

    return EvaluationResponseConversion(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatsOne, statiscs)
}