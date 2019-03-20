import { ABWorkspaces } from './workspaces'
import { GetWorkspaceData, StoreDashRequestURL } from '../clients/storedash'
//import { TestingWorkspaces } from './list'

const InitialABTestParameters: ABTestParameters = { "a": 1, "b": 1 }

export async function getWorkspacesFromMasterContext(ctx: ColossusContext) {
    const masterContext = ctx.vtex
    masterContext.workspace = 'master'
    return await new ABWorkspaces(masterContext)
}

export async function InitializeABTestMaster(account: string, ctx: ColossusContext) {

    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, 'master')

    await masterWorkspaces.set(account, abWorkspace.name, InitialWorkspaceMetadata(abWorkspace))
}

export async function InitializeABTestParams(account: string, workspace: string, ctx: ColossusContext) {

    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, InitialWorkspaceMetadata(abWorkspace))
}

export async function UpdateABTestParams(account: string, workspaceData: WorkspaceData, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspaceData.Workspace)

    await masterWorkspaces.set(account, abWorkspace.name, ToWorkspaceMetadada(workspaceData, abWorkspace.weight, abWorkspace.production))
}

//TODO: return an array
export async function GetAndUpdateWorkspaceData(account: string, aBTestBeginning: string, workspace: string, ctx: ColossusContext): Promise<WorkspaceData> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)

    let workspaceData = await GetWorkspaceData(endPoint, workspace, ctx)
    await UpdateABTestParams(account, workspaceData, ctx)

    return workspaceData
}

export function ToWorkspaceMetadada(workspaceData: WorkspaceData, weight: number, production: boolean): ABWorkspaceMetadata {
    let abWorkspaceMetaData: ABWorkspaceMetadata = {
        name: workspaceData.Workspace,
        weight: weight,
        production: production,
        abTestParameters: ToABTestParameters(workspaceData)
    }
    return abWorkspaceMetaData
}

export function ToABTestParameters(workspaceData: WorkspaceData): ABTestParameters {
    let parameters: ABTestParameters = {
        a: workspaceData.OrderSessions,
        b: workspaceData.NoOrderSessions
    }
    return parameters
}

export function InitialWorkspaceMetadata(Workspace: ABWorkspaceMetadata): ABWorkspaceMetadata {
    let abWorkspaceMetadata: ABWorkspaceMetadata = {
        name: Workspace.name,
        weight: Workspace.weight,
        abTestParameters: InitialABTestParameters,
        production: Workspace.production
    }
    return abWorkspaceMetadata
}