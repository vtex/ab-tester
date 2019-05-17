import { IOContext } from '@vtex/api'
import { GetWorkspaceData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { Last24HoursData } from './recentData'

export async function BuildCompleteData(account: string, abTestBeginning: string, ctx: IOContext, workspacesData: WorkspaceData[]): Promise<WorkspaceCompleteData[]> {
    const workspacesNewData = await Last24HoursData(account, abTestBeginning, ctx)
    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const workspaceCompleteData: WorkspaceCompleteData[] = []
    for (const workspaceNewData of workspacesNewData) {
        if(testingWorkspaces.includes(workspaceNewData.Workspace)) {
            workspaceCompleteData.push(CompleteData(GetWorkspaceData(workspacesData, workspaceNewData.Workspace), workspaceNewData))
        }
    }
    return workspaceCompleteData
}

const CompleteData = (workspaceData: WorkspaceData, workspaceNemData: WorkspaceData): WorkspaceCompleteData => ({
    Last24Hours: workspaceNemData,
    SinceBeginning: workspaceData,
})