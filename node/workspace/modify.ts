import { ABWorkspaces } from './workspaces'
import { StoreDashRequestURL, GetWorkspacesData } from '../clients/storedash'
import { DefaultWorkspaceMetadata, InitialWorkspaceMetadata } from '../utils/workspace-meta-data'

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

export async function FinishABTestMaster(account: string, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, 'master')

    await masterWorkspaces.set(account, abWorkspace.name, DefaultWorkspaceMetadata(abWorkspace))
}

export async function FinishABTestParams(account: string, workspace: string, ctx: ColossusContext) {
    const masterWorkspaces = await getWorkspacesFromMasterContext(ctx)
    const abWorkspace = await masterWorkspaces.get(account, workspace)

    await masterWorkspaces.set(account, abWorkspace.name, DefaultWorkspaceMetadata(abWorkspace))
}

export async function GetAndUpdateWorkspacesData(account: string, aBTestBeginning: string, workspaces: string[], ctx: ColossusContext): Promise<WorkspaceData[]> {
    const endPoint = StoreDashRequestURL(account, aBTestBeginning)
    const workspacesData = await GetWorkspacesData(endPoint, ctx)
    console.log(workspacesData)
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