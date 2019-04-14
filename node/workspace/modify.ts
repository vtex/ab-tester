import { IOContext } from '@vtex/api'
import { IsInitialStage } from '../abTest/initialStage'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { DefaultWorkspaceMetadata, FilteredWorkspacesData, InitialWorkspaceMetadata } from '../utils/workspace'
import { ABWorkspaces } from './workspaces'

async function getWorkspaces(ctx: IOContext) {
    return await new ABWorkspaces(ctx)
}

async function UpdateABTestParams(account: string, workspaceData: WorkspaceData, ctx: IOContext) {
    const masterWorkspaces = await getWorkspaces(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspaceData.Workspace)
    await masterWorkspaces.set(account, abWorkspace.name, ToWorkspaceMetadada(workspaceData, abWorkspace.weight, abWorkspace.production))
}

export async function InitializeABTestParams(account: string, workspace: string, ctx: IOContext) {
    const masterWorkspaces = await getWorkspaces(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, InitialWorkspaceMetadata(abWorkspace))
}

export async function FinishABTestParams(account: string, workspace: string, ctx: IOContext) {
    const masterWorkspaces = await getWorkspaces(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, DefaultWorkspaceMetadata(abWorkspace))
}

export async function UpdateWorkspacesData(account: string, aBTestBeginning: string, workspaces: string[], ctx: IOContext): Promise<void> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    const testingWorkspaces = FilteredWorkspacesData(workspacesData, workspaces)

    if (!(await IsInitialStage(account, workspacesData, ctx))) {
        for (const workspaceData of testingWorkspaces) {
            await UpdateABTestParams(account, workspaceData, ctx)
        }
    }
}

const ToWorkspaceMetadada = (workspaceData: WorkspaceData, weight: number, production: boolean): ABWorkspaceMetadata => {
    return {
        abTestParameters: ToABTestParameters(workspaceData),
        name: workspaceData.Workspace,
        production: (production),
        weight: (weight),
    }
}

const ToABTestParameters = (workspaceData: WorkspaceData): ABTestParameters => {
    return {
        a: workspaceData.OrderSessions,
        b: workspaceData.NoOrderSessions,
    }
}