import { EvaluateConversion, WinnerConversion } from './conversion'
import { EvaluateRevenue, WinnerRevenue } from './revenue'

export async function Evaluate(testType: TestType, abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<EvaluationResult> {

    if (testType === 'revenue') {
        return await EvaluateRevenue(abTestBeginning, workspaceAData, workspaceBData)
    }
    return await EvaluateConversion(abTestBeginning, workspaceAData, workspaceBData)
}

export function WinnerOverAll(testType: TestType, workspacesData: WorkspaceData[]): WinnerOverAll {
    if (testType === 'revenue') {
        return { Winner: WinnerRevenue(workspacesData) }
    }
    return { Winner: WinnerConversion(workspacesData) }
}