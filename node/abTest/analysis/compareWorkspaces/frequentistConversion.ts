import { DefaultResponseFrequentistConversion } from '../../../utils/evaluation-response/default'

export function Evaluate(abTestBeginning: string, workspaceA: WorkspaceCompleteData, workspaceB: WorkspaceCompleteData): FrequentistEvaluationResultConversion {
    return DefaultResponseFrequentistConversion(abTestBeginning, workspaceA.SinceBeginning.Workspace, workspaceB.SinceBeginning.Workspace)
}

export function Winner(_workspacesData: WorkspaceData[]): string {
    return 'master'
}