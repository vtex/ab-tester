import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../mathTools/decision-rule'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { BoundError } from '../../mathTools/statistics/samplesRestrictions'
import { DefaultEvaluationResponse, EvaluationResponse } from '../utils/evaluation-response'
import { WorkspaceToBetaDistribution } from '../utils/workspace'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, probability: number): Promise<TestResult> {
    if (workspaceAData.Sessions === 0 || workspaceBData.Sessions === 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData.Workspace, workspaceBData.Workspace)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))
    const lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData))
    const probabilityTwoBeatOne = ProbabilityOfOneBeatTwo(WorkspaceToBetaDistribution(workspaceBData).a, WorkspaceToBetaDistribution(workspaceBData).b, WorkspaceToBetaDistribution(workspaceAData).a, WorkspaceToBetaDistribution(workspaceAData).b)
    const kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))
    const winner = ChooseWinner(workspaceAData, workspaceBData, BoundError, probability) || 'Not yet decided'

    return EvaluationResponse(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatOne, kldivergence)
}