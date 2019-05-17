import { IOContext } from '@vtex/api'
import { IsInitialStage } from '../abTest/analysis/time/initialStage'
import { BuildCompleteData } from '../abTest/buildData'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { RandomRestart } from '../utils/randomExploration'
import { DefaultWorkspaceMetadata, FilteredWorkspacesData, GetWorkspaceCompleteData, InitialWorkspaceMetadata, ToWorkspaceMetadada } from '../utils/workspace'
import { ABWorkspaces } from './workspaces'

const MasterWorkspaceName = 'master'

export async function InitializeABTestParams(account: string, workspace: string, ctx: IOContext) {
    const workspaces = await new ABWorkspaces(ctx)
    const abWorkspace = await workspaces.get(account, workspace)
    await workspaces.set(account, abWorkspace.name, InitialWorkspaceMetadata(abWorkspace))
}

export async function FinishABTestParams(account: string, workspace: string, ctx: IOContext) {
    const workspaces = await new ABWorkspaces(ctx)
    const abWorkspace = await workspaces.get(account, workspace)
    await workspaces.set(account, abWorkspace.name, DefaultWorkspaceMetadata(abWorkspace))
}

async function UpdateABTestParams(account: string, workspaceData: WorkspaceData, ctx: IOContext) {
    const workspaces = await new ABWorkspaces(ctx)
    const abWorkspace = await workspaces.get(account, workspaceData.Workspace)
    await workspaces.set(account, abWorkspace.name, ToWorkspaceMetadada(workspaceData, abWorkspace.weight, abWorkspace.production))
}

export async function UpdateWorkspacesData(account: string, aBTestBeginning: string, workspaces: string[], ctx: IOContext): Promise<void> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    if (await IsInitialStage(account, workspacesData, ctx)) {
        return
    }

    const testingWorkspaces = FilteredWorkspacesData(workspacesData, workspaces)
    const workspacesCompleteData = await BuildCompleteData(account, aBTestBeginning, ctx, testingWorkspaces)
    const masterWorkspace = GetWorkspaceCompleteData(workspacesCompleteData, MasterWorkspaceName)
    let randomRestart: boolean = false
    for (const workspaceCompleteData of workspacesCompleteData) {
        randomRestart = workspaceCompleteData.SinceBeginning.Workspace === masterWorkspace.SinceBeginning.Workspace ? false : RandomRestart(workspaceCompleteData, masterWorkspace)
        if (!randomRestart) {
            for (const workspaceData of testingWorkspaces) {
                await UpdateABTestParams(account, workspaceData, ctx)
            }
            return
        }
    }
    for (const workspaceData of testingWorkspaces) {
        await InitializeABTestParams(account, workspaceData.Workspace, ctx)
    }
}