import { DefaultResponseBayesianRevenue } from '../../../utils/evaluation-response/default'

export function Evaluate(abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): BayesianEvaluationResultRevenue {
    return DefaultResponseBayesianRevenue(abTestBeginning, workspaceA.SinceBeginning.Workspace, workspaceB.SinceBeginning.Workspace)
}

export function Winner(_workspacesData: WorkspaceData[]): string {
    return 'master'
}