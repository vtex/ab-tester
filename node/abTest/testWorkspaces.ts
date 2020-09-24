import Storedash from '../clients/storedash'
import TestingWorkspaces from '../typings/testingWorkspace'
import { DefaultEvaluationResponseConversion } from '../utils/evaluation-response'
import { FilteredWorkspacesData } from '../utils/workspace'
import { EvaluateConversion } from './analysis/compareWorkspaces/conversion'
import { BuildCompleteData } from './data/buildData'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, testingWorkspaces: TestingWorkspaces, testType: TestType, ctx: Context): Promise<TestResult[]> {
    const { clients: { abTestRouter, storedash } } = ctx
    const Results: TestResult[] = []

    if (testingWorkspaces.Length() > 0) {
        try {
            const workspacesData = await FilterWorkspacesData(abTestBeginning, testingWorkspaces.WorkspacesNames(), storedash, testType)

            if (!HasWorkspacesData(workspacesData)) {
                for (const workspaceName of testingWorkspaces.WorkspacesNames()) {
                    if (workspaceName !== MasterWorkspaceName) {
                        Results.push(DefaultEvaluationResponseConversion(abTestBeginning, MasterWorkspaceName, workspaceName))
                    }
                }
            } else {
                const workspacesCompleteData = await BuildCompleteData(account, abTestBeginning, workspacesData, storedash, abTestRouter)
                const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)

                for (const workspaceData of workspacesCompleteData) {
                    if (workspaceData[0] !== MasterWorkspaceName) {
                        Results.push(await EvaluateConversion(abTestBeginning, masterWorkspace!, workspaceData[1]))
                    }
                }
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

async function FilterWorkspacesData(aBTestBeginning: string, testingWorkspaces: string[], storedash: Storedash, testType: TestType): Promise<WorkspaceData[]> {
    let workspacesData: WorkspaceData[] = []

    if (testType === 'conversion') {
        workspacesData = await storedash.getWorkspacesData(aBTestBeginning)
    }
    if (testType === 'revenue') {
        workspacesData = (await storedash.getWorkspacesGranularData(aBTestBeginning)).data
    }
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    return (workspacesData.length > 0)
}