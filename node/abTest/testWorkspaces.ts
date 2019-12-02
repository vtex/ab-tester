import Storedash from '../clients/storedash'
import TestingWorkspaces from '../typings/testingWorkspace'
import { DefaultEvaluationResponse } from '../utils/evaluation-response'
import { MinutesSinceQuery } from '../utils/hoursSince'
import { FilteredWorkspacesData } from '../utils/workspace'
import { Evaluate } from './analysis/compareWorkspaces/conversion'
import { BuildCompleteData } from './data/buildData'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, workspacesMetadata: ABTestWorkspacesMetadata, ctx: Context): Promise<TestResult[]> {
    const { clients: { abTestRouter, storedash } } = ctx
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    const Results: TestResult[] = []

    if (testingWorkspaces.Length() > 0) {
        const beginningQuery = MinutesSinceQuery(abTestBeginning)
        const workspacesData = await FilterWorkspacesData(beginningQuery, testingWorkspaces.WorkspacesNames(), storedash)

        if (!HasWorkspacesData(workspacesData)) {
            for (const workspaceName of testingWorkspaces.WorkspacesNames()) {
                if (workspaceName !== 'master') {
                    Results.push(DefaultEvaluationResponse(abTestBeginning, MasterWorkspaceName, workspaceName))
                }
            }
            return Results
        }
        const workspacesCompleteData = await BuildCompleteData(account, abTestBeginning, workspacesData, storedash, abTestRouter)
        const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)

        for (const workspaceData of workspacesCompleteData) {
            if (workspaceData[0] !== MasterWorkspaceName) {
                Results.push(await Evaluate(abTestBeginning, masterWorkspace!, workspaceData[1]))
            }
        }
    }
    return Results
}

async function FilterWorkspacesData(aBTestBeginning: string, testingWorkspaces: string[], storedash: Storedash): Promise<WorkspaceData[]> {
    const workspacesData = await storedash.getWorkspacesData(aBTestBeginning)
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    if(workspacesData.length > 0) {
        return true
    }
    return false
}