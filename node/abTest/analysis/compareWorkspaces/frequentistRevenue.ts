import { DefaultResponseFrequentistRevenue } from '../../../utils/evaluation-response/default'
import { EvaluationResponseFrequentistRevenue } from '../../../utils/evaluation-response/evaluation'
import { RevenueToNormalDistribution } from '../../../utils/workspace'
import { PValue, PickWinner, UpLiftChoosingA } from '../../../utils/mathTools/decisionRule/frequentist'

export function Evaluate(abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): FrequentistEvaluationResultRevenue {
    if (workspaceA.SinceBeginning.Sessions === 0 || workspaceB.SinceBeginning.Sessions === 0) {
        return DefaultResponseFrequentistRevenue(abTestBeginning, workspaceA.SinceBeginning.Workspace, workspaceB.SinceBeginning.Workspace)
    }
    
    const parametersA = RevenueToNormalDistribution(workspaceA.SinceBeginning)
    const parametersB = RevenueToNormalDistribution(workspaceB.SinceBeginning)

    const pValue = PValue(parametersA, parametersB)
    const winner = PickWinner(workspaceA.Last24Hours.Workspace, workspaceB.Last24Hours.Workspace, parametersA, parametersB, pValue)
    const upLiftChoosingA = UpLiftChoosingA(parametersA, parametersB)
    const upLiftChoosingB = UpLiftChoosingA(parametersB, parametersA)

    return EvaluationResponseFrequentistRevenue(abTestBeginning, workspaceA, workspaceB, winner, pValue, upLiftChoosingA, upLiftChoosingB)
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
    const parametersA = RevenueToNormalDistribution(workspaceA)
    const parametersB = RevenueToNormalDistribution(workspaceB)
    const pValue = PValue(parametersA, parametersB)
    const better = PickWinner(workspaceA.Workspace, workspaceB.Workspace, parametersA, parametersB, pValue)

    return better === workspaceB.Workspace ? workspaceB : workspaceA
}