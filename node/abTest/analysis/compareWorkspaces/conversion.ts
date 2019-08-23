import { DefaultEvaluationResponse, EvaluationResponse } from '../../../utils/evaluation-response'
import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../../utils/mathTools/forBetaDistribution/decisionRule'
import { BoundError, pValue } from '../../../utils/mathTools/statistics/samplesRestrictions'
import { WorkspaceToBetaDistribution } from '../../../utils/workspace'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData.SinceBeginning), WorkspaceToBetaDistribution(workspaceBData.SinceBeginning))
    const lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData.SinceBeginning), WorkspaceToBetaDistribution(workspaceAData.SinceBeginning))
    const betaDistributionA = WorkspaceToBetaDistribution(workspaceAData.SinceBeginning)
    const betaDistributionB = WorkspaceToBetaDistribution(workspaceBData.SinceBeginning)
    const probabilityTwoBeatOne = ProbabilityOfOneBeatTwo(betaDistributionB.a, betaDistributionB.b, betaDistributionA.a, betaDistributionA.b)
    const statiscs = pValue(betaDistributionA, betaDistributionB)
    const winner = ChooseWinner(workspaceAData.SinceBeginning, workspaceBData.SinceBeginning, BoundError) || 'Not yet decided'
    
    return EvaluationResponse(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatOne, statiscs)
}