import { WorkspaceToBayesRevParameters } from '../../../utils/workspace'
import { PickWinner, LossChoosingB, ProbabilityXIsBest } from '../../../utils/mathTools/decisionRule/bayesianRevenue'
import { DefaultResponseBayesianRevenue } from '../../../utils/evaluation-response/default'
import { EvaluationResponseBayesianRevenue } from '../../../utils/evaluation-response/evaluation'

export function Evaluate(abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): BayesianEvaluationResultRevenue {
    if (workspaceA.SinceBeginning.Sessions === 0 || workspaceB.SinceBeginning.Sessions === 0) {
        return DefaultResponseBayesianRevenue(abTestBeginning, workspaceA.SinceBeginning.Workspace, workspaceB.SinceBeginning.Workspace)
    }

    const parametersA = WorkspaceToBayesRevParameters(workspaceA.SinceBeginning)
    const parametersB = WorkspaceToBayesRevParameters(workspaceB.SinceBeginning)

    const probabilityAbeatsB = ProbabilityXIsBest(parametersA, [parametersB])
    const lossChoosingA = LossChoosingB(parametersB, parametersA)
    const lossChoosingB = LossChoosingB(parametersA, parametersB)
    const winner = PickWinner(workspaceA.Last24Hours.Workspace, workspaceB.Last24Hours.Workspace, lossChoosingA, lossChoosingB)

    return EvaluationResponseBayesianRevenue(abTestBeginning, workspaceA, workspaceB, winner, probabilityAbeatsB, lossChoosingA, lossChoosingB)
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
    const parametersA = WorkspaceToBayesRevParameters(workspaceA)
    const parametersB = WorkspaceToBayesRevParameters(workspaceB)
    const lossChoosingA = LossChoosingB(parametersB, parametersA)
    const lossChoosingB = LossChoosingB(parametersA, parametersB)

    const better = PickWinner(workspaceA.Workspace, workspaceB.Workspace, lossChoosingA, lossChoosingB)
    return better === workspaceB.Workspace ? workspaceB : workspaceA
}