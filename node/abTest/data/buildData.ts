import Router from '../../clients/router'
import Storedash from '../../clients/storedash'
import { GetWorkspaceData } from '../../utils/workspace'
import { Last24HoursData } from './recentData'

export async function BuildCompleteData(account: string, abTestBeginning: string, workspacesData: WorkspaceData[], storedash: Storedash, router: Router): Promise<Map<string, WorkspaceCompleteData>> {
    try {
        const workspacesNewData = await Last24HoursData(abTestBeginning, storedash)
        const testingWorkspaces = await router.getWorkspaces(account)
        const workspaceCompleteData = new Map()
        for (const workspaceNewData of workspacesNewData) {
            if(testingWorkspaces.Includes(workspaceNewData.Workspace)) {
                workspaceCompleteData.set(workspaceNewData.Workspace, CompleteData(GetWorkspaceData(workspacesData, workspaceNewData.Workspace), workspaceNewData))
            }
        }
        return workspaceCompleteData
    } catch (err) {
        err.message = `Error building test's data: ` + err.message
        throw err
    }
}

const CompleteData = (workspaceData: WorkspaceData, workspaceNewData: WorkspaceData): WorkspaceCompleteData => ({
    Last24Hours: workspaceNewData,
    SinceBeginning: workspaceData,
})