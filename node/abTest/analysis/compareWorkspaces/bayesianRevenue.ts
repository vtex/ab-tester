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

export function Winner(testResult: TestResult): string {
    const results = testResult as BayesianEvaluationResultRevenue[]

    if (!results || results.length === 0) return 'master'

    if (results[0].ExpectedLossChoosingA < results[0].ExpectedLossChoosingB) {
        results.shift()
        return Winner(results)
    }

    let winner = results[0].WorkspaceB
    let loss = results[0].ExpectedLossChoosingB

    for (let i = 1; i < results.length; i++) {
        if (results[i].ExpectedLossChoosingB < loss) {
            winner = results[i].WorkspaceB
            loss = results[i].ExpectedLossChoosingB
        }
    }
    return winner
}