import Storedash from '../clients/storedash'
import TestingWorkspaces from '../typings/testingWorkspace'
import { DefaultEvaluationResponse } from '../utils/evaluation-response/default'
import { FilteredWorkspacesData } from '../utils/workspace'
import { Evaluate, WinnerOverAll } from './analysis/compareWorkspaces'
import { BuildCompleteData } from './data/buildData'
import { GetGranularData } from './data/cachedData'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(ctx: Context, account: string, abTestBeginning: string, testingWorkspaces: TestingWorkspaces,
    testType: TestType, approach: TestApproach): Promise<TestResult> {

    const { clients: { abTestRouter, storedash } } = ctx
    const Results: TestResult = []

    if (testingWorkspaces.Length() > 0) {
        try {
            const workspacesData = await FilterWorkspacesData(ctx, abTestBeginning, testingWorkspaces.WorkspacesNames(), storedash, testType, approach)

            if (!HasWorkspacesData(workspacesData)) {
                for (const workspaceName of testingWorkspaces.WorkspacesNames()) {
                    if (workspaceName !== MasterWorkspaceName) {
                        Results.push(DefaultEvaluationResponse(abTestBeginning, MasterWorkspaceName, workspaceName, testType, approach))
                    }
                }
            } else {
                const workspacesCompleteData = await BuildCompleteData(account, abTestBeginning, workspacesData, storedash, abTestRouter)
                const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)

                for (const workspaceData of workspacesCompleteData) {
                    if (workspaceData[0] !== MasterWorkspaceName) {
                        Results.push(Evaluate(testType, approach, abTestBeginning, masterWorkspace!, workspaceData[1]))
                    }
                }

                Results.push(WinnerOverAll(testType, approach, Results))

            }
        } catch (err) {
            err.message = 'Error evaluating test results: ' + err.message
            throw err
        }
    }
    if (Results.length === 0) {
        throw new Error(`Error evaluating test's results: inconsistent data about initialized test`)
    }
    return Results
}

async function FilterWorkspacesData(ctx: Context, aBTestBeginning: string, testingWorkspaces: string[], storedash: Storedash, testType: TestType,
    testApproach: TestApproach): Promise<WorkspaceData[]> {

    let workspacesData: WorkspaceData[] = []

    if (testType === 'revenue' && testApproach === 'frequentist') {
        workspacesData = (await GetGranularData(ctx))
    } else {
        workspacesData = await storedash.getWorkspacesData(aBTestBeginning)
    }
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    return (workspacesData.length > 0)
}