import { IsInitialStage } from '../abTest/initialStage'
import { GetWorkspacesData, StoreDashRequestURL } from '../clients/storedash'
import { DefaultWorkspaceMetadata, InitialWorkspaceMetadata } from '../utils/workspace'
import { ABWorkspaces } from './workspaces'

async function getWorkspacesFromMasterContext(ctx: ColossusContext) {
    const masterContext = ctx.vtex
    masterContext.workspace = 'master'
    return await new ABWorkspaces(masterContext)
}

async function UpdateABTestParams(account: string, workspaceData: WorkspaceData, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspaceData.Workspace)
    await masterWorkspaces.set(account, abWorkspace.name, ToWorkspaceMetadada(workspaceData, abWorkspace.weight, abWorkspace.production))
}

export async function InitializeABTestParams(account: string, workspace: string, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, InitialWorkspaceMetadata(abWorkspace))
}

export async function FinishABTestParams(account: string, workspace: string, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, DefaultWorkspaceMetadata(abWorkspace))
}

export async function GetAndUpdateWorkspacesData(account: string, aBTestBeginning: string, workspaces: string[], ctx: ColossusContext): Promise<WorkspaceData[]> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    const testingWorkspacesData: WorkspaceData[] = []

    for (const workspaceData of workspacesData) {
        if (workspaces.includes(workspaceData.Workspace)) {
            if (!(await IsInitialStage(account, workspaceData, ctx))) {
                await UpdateABTestParams(account, workspaceData, ctx)
            }
            testingWorkspacesData.push(workspaceData)
        }
    }

    return testingWorkspacesData
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