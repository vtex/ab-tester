import { EvaluateConversion, WinnerConversion } from './conversion'
import { EvaluateRevenue, WinnerRevenue } from './revenue'

export async function Evaluate(testType: TestType, abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {

    if (testType === 'revenue') {
        return await EvaluateRevenue(abTestBeginning, workspaceAData, workspaceBData)
    }
    return await EvaluateConversion(abTestBeginning, workspaceAData, workspaceBData)
}

export function WinnerOverAll(testType: TestType, workspacesData: WorkspaceData[]): string {
    if (testType === 'revenue') {
        return WinnerRevenue(workspacesData)
    }
    return WinnerConversion(workspacesData)
}