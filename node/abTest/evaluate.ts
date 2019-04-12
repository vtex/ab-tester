import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../mathTools/decision-rule'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { BoundError } from '../../mathTools/statistics/samplesRestrictions'
import { DefaultEvaluationResponse, EvaluationResponse } from '../utils/evaluation-response'
import { WorkspaceToBetaDistribution } from '../utils/workspace'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData, probability: number): Promise<TestResult> {
    if (workspaceAData.SinceBeginning.Sessions === 0 || workspaceBData.SinceBeginning.Sessions === 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData.SinceBeginning.Workspace, workspaceBData.SinceBeginning.Workspace)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData.SinceBeginning), WorkspaceToBetaDistribution(workspaceBData.SinceBeginning))
    const lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData.SinceBeginning), WorkspaceToBetaDistribution(workspaceAData.SinceBeginning))
    const probabilityTwoBeatOne = ProbabilityOfOneBeatTwo(WorkspaceToBetaDistribution(workspaceBData.SinceBeginning).a, WorkspaceToBetaDistribution(workspaceBData.SinceBeginning).b, WorkspaceToBetaDistribution(workspaceAData.SinceBeginning).a, WorkspaceToBetaDistribution(workspaceAData.SinceBeginning).b)
    const kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData.SinceBeginning), WorkspaceToBetaDistribution(workspaceBData.SinceBeginning))
    const winner = ChooseWinner(workspaceAData.SinceBeginning, workspaceBData.SinceBeginning, BoundError, probability) || 'Not yet decided'

    return EvaluationResponse(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatOne, kldivergence)
}