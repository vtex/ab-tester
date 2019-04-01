import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../mathTools/decision-rule';
import { BoundError } from '../../mathTools/statistics/samplesRestrictions'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from '../utils/workspace'
import { DefaultEvaluationResponse, EvaluationResponse } from '../utils/evaluation-response'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, probability: number): Promise<TestResult> {
    if (workspaceAData["Sessions"] == 0 || workspaceBData["Sessions"] == 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData.Workspace, workspaceBData.Workspace)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        probabilityTwoBeatOne = ProbabilityOfOneBeatTwo(WorkspaceToBetaDistribution(workspaceBData).a, WorkspaceToBetaDistribution(workspaceBData).b, WorkspaceToBetaDistribution(workspaceAData).a, WorkspaceToBetaDistribution(workspaceAData).b),
        kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        winner = ChooseWinner(workspaceAData, workspaceBData, BoundError, probability) || 'not yet decided'

    return EvaluationResponse(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityTwoBeatOne, kldivergence)
}