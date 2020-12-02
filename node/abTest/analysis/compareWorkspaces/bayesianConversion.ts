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

export function Winner(workspacesData: WorkspaceData[]): string {
    if (!workspacesData || workspacesData.length === 0) return 'master'

    let winner = workspacesData[0]
    for (const workspace of workspacesData) {
        winner = chooseBetter(winner, workspace)
    }
    return winner.Workspace
}

function chooseBetter(workspaceA: WorkspaceData, workspaceB: WorkspaceData): WorkspaceData {
    const better = ChooseWinner(workspaceA, workspaceB)
    return better === workspaceB.Workspace ? workspaceB : workspaceA
}