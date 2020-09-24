import { EvaluateConversion } from './conversion'
import { EvaluateRevenue } from './revenue'

export async function Evaluate(testType: TestType, abTestBeginning: string, workspaceAData: WorkspaceCompleteData, workspaceBData: WorkspaceCompleteData): Promise<TestResult> {

    if (testType === 'revenue') {
        return await EvaluateRevenue(abTestBeginning, workspaceAData, workspaceBData)
    }
    return await EvaluateConversion(abTestBeginning, workspaceAData, workspaceBData)
}