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

export function Winner(testResult: TestResult): string {
    const results = testResult as FrequentistEvaluationResultRevenue[]

    if (!results || results.length === 0) return 'master'

    let winner = 'master'
    let averageRevenue = results[0].AverageRevenueA

    for (const workspace of results) {
        if (workspace.AverageRevenueB > averageRevenue) {
            winner = workspace.WorkspaceB
            averageRevenue = workspace.AverageRevenueB
        }
    }
    return winner
}