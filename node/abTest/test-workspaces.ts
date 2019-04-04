import { HoursSince } from '../utils/hoursSince'
import { GetWorkspaceData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { GetAndUpdateWorkspacesData } from '../workspace/modify'
import { Evaluate } from './evaluate'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, probability: number, ctx: ColossusContext): Promise<TestResult[]> {
    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const beginningQuery = HoursSince(abTestBeginning)
    const workspacesData = await GetAndUpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx)

    const masterWorkspace = await GetWorkspaceData(workspacesData, MasterWorkspaceName)
    const Results: TestResult[] = []
    for (const workspaceData of workspacesData) {
        if (workspaceData.Workspace !== masterWorkspace.Workspace) {
            Results.push(await Evaluate(abTestBeginning, masterWorkspace, workspaceData, probability))
        }
    }
    return Results
}