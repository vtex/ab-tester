import { IOContext } from '@vtex/api'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { DefaultEvaluationResponse } from '../utils/evaluation-response'
import { HoursSince } from '../utils/hoursSince'
import { FilteredWorkspacesData, GetWorkspaceCompleteData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { UpdateWorkspacesData } from '../workspace/modify'
import { BuildCompleteData } from './buildData'
import { Evaluate } from './evaluate'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, probability: number, ctx: ColossusContext): Promise<TestResult[]> {
    const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
    const beginningQuery = HoursSince(abTestBeginning)
    const workspacesData = await FilterWorkspacesData(account, beginningQuery, testingWorkspaces, ctx.vtex)
    const Results: TestResult[] = []
    if (workspacesData.length > 0) {
        await UpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx.vtex)
        const workspacesCompleteData = await BuildCompleteData(account, ctx, workspacesData)

        const masterWorkspace = await GetWorkspaceCompleteData(workspacesCompleteData, MasterWorkspaceName)
        for (const workspaceData of workspacesCompleteData) {
            if (workspaceData.SinceBeginning.Workspace !== masterWorkspace.SinceBeginning.Workspace) {
                Results.push(await Evaluate(abTestBeginning, masterWorkspace, workspaceData, probability))
            }
        }
    }
    else {
        for (const workspaceName of testingWorkspaces) {
            if (workspaceName !== 'master') {
                Results.push(DefaultEvaluationResponse(abTestBeginning, 'master', workspaceName))
            }
        }
    }
    // console.log(testingWorkspaces)
    return Results
}

async function FilterWorkspacesData(account: string, aBTestBeginning: string, testingWorkspaces: string[], ctx: IOContext): Promise<WorkspaceData[]> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}