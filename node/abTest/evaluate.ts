import { ChooseWinner, LossFunctionChossingVariantOne, ProbabilityOfOneBeatTwo } from '../../mathTools/decision-rule';
import { BoundError } from '../../mathTools/statistics/samples-restrictions'
import { KLDivergence } from '../../mathTools/statistics/kullback-leibler'
import { WorkspaceToBetaDistribution } from '../abTest/workspace-to-distribution'
import { DefaultEvaluationResponse, EvaluationResponse } from '../utils/evaluation-response'

export async function Evaluate(abTestBeginning: string, workspaceAData: WorkspaceData, workspaceBData: WorkspaceData, probability: number): Promise<TestResult> {
    if (workspaceAData["Sessions"] == 0 || workspaceBData["Sessions"] == 0) {
        return DefaultEvaluationResponse(abTestBeginning, workspaceAData, workspaceBData)
    }

    const lossA = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData)),
        lossB = LossFunctionChossingVariantOne(WorkspaceToBetaDistribution(workspaceBData), WorkspaceToBetaDistribution(workspaceAData)),
        probabilityOneBeatTwo = ProbabilityOfOneBeatTwo(WorkspaceToBetaDistribution(workspaceBData).parameterA, WorkspaceToBetaDistribution(workspaceBData).parameterB, WorkspaceToBetaDistribution(workspaceAData).parameterA, WorkspaceToBetaDistribution(workspaceAData).parameterB),
        kldivergence = KLDivergence(WorkspaceToBetaDistribution(workspaceAData), WorkspaceToBetaDistribution(workspaceBData))

    const winner = ChooseWinner(workspaceAData, workspaceBData, BoundError, probability) || 'not yet decided'
    return EvaluationResponse(abTestBeginning, workspaceAData, workspaceBData, winner, lossA, lossB, probabilityOneBeatTwo, kldivergence)
}