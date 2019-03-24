import { TestingWorkspaces } from '../workspace/list'
import { GetAndUpdateWorkspacesData } from '../workspace/modify'
import { GetWorkspaceData } from '../utils/get-workspace'
import { Evaluate } from './evaluate'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, probability: number, ctx: ColossusContext): Promise<TestResult[]> {
    let Results: TestResult[] = []
    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const workspacesData = await GetAndUpdateWorkspacesData(account, abTestBeginning, testingWorkspaces, ctx)
    console.log(workspacesData)
    const masterWorkspace = await GetWorkspaceData(workspacesData, MasterWorkspaceName)

    for (var workspaceData of workspacesData) {
        if (workspaceData.Workspace != masterWorkspace.Workspace) {
            Results.push(await Evaluate(abTestBeginning, masterWorkspace, workspaceData, probability))
        }
    }
    return Results
}