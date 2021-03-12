import Storedash from '../clients/storedash'
import TestingWorkspaces from '../typings/testingWorkspace'
import { DefaultEvaluationResponseConversion } from '../utils/evaluation-response'
import { FilteredWorkspacesData } from '../utils/workspace'
import { Evaluate } from './analysis/compareWorkspaces/conversion'
import { BuildCompleteData } from './data/buildData'

const MasterWorkspaceName = 'master'

export async function TestWorkspaces(account: string, abTestBeginning: string, testingWorkspaces: TestingWorkspaces, ctx: Context): Promise<TestResult[]> {
    const { clients: { abTestRouter, storedash } } = ctx
    const Results: TestResult[] = []

    if (testingWorkspaces.Length() > 0) {
        try {
            const workspacesData = await FilterWorkspacesData(abTestBeginning, testingWorkspaces.WorkspacesNames(), storedash)

            if (!HasWorkspacesData(workspacesData)) {
                for (const workspaceName of testingWorkspaces.WorkspacesNames()) {
                    if (workspaceName !== 'master') {
                        Results.push(DefaultEvaluationResponseConversion(abTestBeginning, MasterWorkspaceName, workspaceName))
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
        } catch (err) {
            err.message = 'Error evaluating test results: ' + err.message
            throw err
        }
    }
    return Results
}

async function FilterWorkspacesData(aBTestBeginning: string, testingWorkspaces: string[], storedash: Storedash): Promise<WorkspaceData[]> {
    const workspacesData = await storedash.getWorkspacesData(aBTestBeginning)
    return FilteredWorkspacesData(workspacesData, testingWorkspaces)
}

const HasWorkspacesData = (workspacesData: WorkspaceData[]): boolean => {
    return (workspacesData.length > 0)
}