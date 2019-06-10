import { IOContext } from '@vtex/api'
import { IsInitialStage } from '../abTest/analysis/time/initialStage'
import { BuildCompleteData } from '../abTest/data/buildData'
import Router from '../clients/router'
import Storedash from '../clients/storedash'
import { RandomRestart } from '../utils/randomExploration'
import { DefaultWorkspaceMetadata, FilteredWorkspacesData, InitialWorkspaceMetadata, ToWorkspaceMetadada } from '../utils/workspace'
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
    if(Math.min(workspaceData.NoOrderSessions, workspaceData.OrderSessions) >= 1) {
        await workspaces.set(account, abWorkspace.name, ToWorkspaceMetadada(workspaceData, abWorkspace.weight, abWorkspace.production))
    }
}

export async function UpdateWorkspacesData(account: string, aBTestBeginning: string, workspaces: string[], ctx: IOContext, router: Router, storedash: Storedash): Promise<void> {
    const workspacesData = await storedash.getWorkspacesData(aBTestBeginning)
    if (await IsInitialStage(workspacesData, storedash)) {
        return
    }

    const testingWorkspaces = FilteredWorkspacesData(workspacesData, workspaces)
    const workspacesCompleteData = await BuildCompleteData(account, aBTestBeginning, testingWorkspaces, storedash, router)
    const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)
    let randomRestart: boolean = false
    for (const workspaceCompleteData of workspacesCompleteData) {
        randomRestart = workspaceCompleteData[0] === MasterWorkspaceName ? false : RandomRestart(workspaceCompleteData[1], masterWorkspace!)
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