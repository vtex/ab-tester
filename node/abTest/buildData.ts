import { GetWorkspaceData } from '../utils/workspace'
import { TestingWorkspaces } from '../workspace/list'
import { Last24HoursData } from './recentData'

export async function BuildCompleteData(account: string, ctx: ColossusContext, workspacesData: WorkspaceData[]): Promise<WorkspaceCompleteData[]> {
    const workspacesNewData = await Last24HoursData(account, ctx.vtex)
    const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
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