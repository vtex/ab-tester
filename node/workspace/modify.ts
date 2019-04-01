import { ABWorkspaces } from './workspaces'
import { StoreDashRequestURL, GetWorkspacesData } from '../clients/storedash'
import { DefaultWorkspaceMetadata, InitialWorkspaceMetadata } from '../utils/workspace'

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
    let testingWorkspacesData: WorkspaceData[] = []

    for (var workspaceData of workspacesData) {
        if (workspaces.includes(workspaceData.Workspace)) {
            if (workspaceData.OrderSessions >= 1) {
                await UpdateABTestParams(account, workspaceData, ctx)
            }
            testingWorkspacesData.push(workspaceData)
        }
    }

    return testingWorkspacesData
}

const ToWorkspaceMetadada = (workspaceData: WorkspaceData, weight: number, production: boolean): ABWorkspaceMetadata => {
    return {
        name: workspaceData.Workspace,
        weight: weight,
        production: production,
        abTestParameters: ToABTestParameters(workspaceData)
    }
}

const ToABTestParameters = (workspaceData: WorkspaceData): ABTestParameters => {
    return {
        a: workspaceData.OrderSessions,
        b: workspaceData.NoOrderSessions
    }
}