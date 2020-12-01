import { DefaultResponseFrequentistRevenue } from '../../../utils/evaluation-response/default'

export function Evaluate(abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): FrequentistEvaluationResultRevenue {
    return DefaultResponseFrequentistRevenue(abTestBeginning, workspaceA.SinceBeginning.Workspace, workspaceB.SinceBeginning.Workspace)
}

export function Winner(_workspacesData: WorkspaceData[]): string {
    return 'master'
}