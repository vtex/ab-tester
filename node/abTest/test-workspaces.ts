import { IOContext } from '@vtex/api'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { DefaultEvaluationResponse } from '../utils/evaluation-response'
import { MinutesSinceQuery } from '../utils/hoursSince'
import { FilteredWorkspacesData, GetWorkspaceCompleteData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { Evaluate } from './analysis/conversion/compareWorkspaces'
import { BuildCompleteData } from './buildData'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, probability: number, ctx: ColossusContext): Promise<TestResult[]> {
    const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
    const Results: TestResult[] = []
    if (IsTestInitialized(testingWorkspaces)) {
        const beginningQuery = MinutesSinceQuery(abTestBeginning)
        const workspacesData = await FilterWorkspacesData(account, beginningQuery, testingWorkspaces, ctx.vtex)
        if (!HasWorkspacesData(workspacesData)) {
            for (const workspaceName of testingWorkspaces) {
                if (workspaceName !== 'master') {
                    Results.push(DefaultEvaluationResponse(abTestBeginning, 'master', workspaceName))
                }
            }
            return Results
        }
        const workspacesCompleteData = await BuildCompleteData(account, abTestBeginning, ctx.vtex, workspacesData)
        const masterWorkspace = GetWorkspaceCompleteData(workspacesCompleteData, MasterWorkspaceName)

        for (const workspaceData of workspacesCompleteData) {
            if (workspaceData.SinceBeginning.Workspace !== masterWorkspace.SinceBeginning.Workspace) {
                Results.push(await Evaluate(abTestBeginning, masterWorkspace, workspaceData, probability))
            }
        }
    }
    return Results
}

async function FilterWorkspacesData(account: string, aBTestBeginning: string, testingWorkspaces: string[], ctx: IOContext): Promise<WorkspaceData[]> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const IsTestInitialized = (testingWorkspaces: string[]): boolean => {
    if(testingWorkspaces.length > 0) {
        return true
    }
    return false
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    if(workspacesData.length > 0) {
        return true
    }
    return false
}