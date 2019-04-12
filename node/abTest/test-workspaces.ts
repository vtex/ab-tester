import { HoursSince } from '../utils/hoursSince'
import { GetWorkspaceCompleteData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { GetAndUpdateWorkspacesData } from '../workspace/modify'
import { BuildCompleteData } from './buildData'
import { Evaluate } from './evaluate'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, probability: number, ctx: ColossusContext): Promise<TestResult[]> {
    const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
    const beginningQuery = HoursSince(abTestBeginning)
    const workspacesData = await GetAndUpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx.vtex)
    const workspacesCompleteData = await BuildCompleteData(account, ctx, workspacesData)

    const masterWorkspace = await GetWorkspaceCompleteData(workspacesCompleteData, MasterWorkspaceName)
    const Results: TestResult[] = []
    for (const workspaceData of workspacesCompleteData) {
        if (workspaceData.SinceBeginning.Workspace !== masterWorkspace.SinceBeginning.Workspace) {
            Results.push(await Evaluate(abTestBeginning, masterWorkspace, workspaceData, probability))
        }
    }
    return Results
}