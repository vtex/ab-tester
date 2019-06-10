import Router from '../../clients/router'
import Storedash from '../../clients/storedash'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { GetWorkspaceData } from '../../utils/workspace'
import { Last24HoursData } from './recentData'

export async function BuildCompleteData(account: string, abTestBeginning: string, workspacesData: WorkspaceData[], storedash: Storedash, router: Router): Promise<Map<string, WorkspaceCompleteData>> {
    const workspacesNewData = await Last24HoursData(abTestBeginning, storedash)
    const testingWorkspaces = new TestingWorkspaces(await router.getWorkspaces(account))
    const workspaceCompleteData = new Map()
    for (const workspaceNewData of workspacesNewData) {
        if(testingWorkspaces.Includes(workspaceNewData.Workspace)) {
            workspaceCompleteData[workspaceNewData.Workspace] = CompleteData(GetWorkspaceData(workspacesData, workspaceNewData.Workspace), workspaceNewData)
        }
    }
    return workspaceCompleteData
}

const CompleteData = (workspaceData: WorkspaceData, workspaceNewData: WorkspaceData): WorkspaceCompleteData => ({
    Last24Hours: workspaceNewData,
    SinceBeginning: workspaceData,
})