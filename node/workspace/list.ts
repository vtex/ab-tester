import { ABWorkspaces } from './workspaces'

const DefaultABTestParameters: ABTestParameters = { "a": 0, "b": 0 }

export async function ListWorkspaces(account: string, ctx: ColossusContext): Promise<ABWorkspaceMetadata[]> {
    const masterContext = ctx.vtex
    masterContext.workspace = 'master'
    const masterWorkspace = await new ABWorkspaces(masterContext)
    return await masterWorkspace.list(account)
}

export async function TestingWorkspaces(account: string, ctx: ColossusContext): Promise<ABWorkspaceMetadata[]> {
    const workspaces = await ListWorkspaces(account, ctx)
    let testingWorkspaces : ABWorkspaceMetadata[] = []
    for (var workspace of workspaces) {
        if (MinimumABTestParameter(workspace) >= 1) {
            testingWorkspaces.push(workspace)
        }
    }
    return testingWorkspaces
}

export async function FindWorkspace(account: string, workspaceName: string, ctx: ColossusContext): Promise<boolean> {
    const workspaces = await ListWorkspaces(account, ctx)
    for (var workspace of workspaces) {
        if (workspace.name == workspaceName) {
            return true
        }
    }
    return false
}

export function MinimumABTestParameter(workspace: ABWorkspaceMetadata) {
    const params = workspace["abTestParameters"] || DefaultABTestParameters
    return Math.min(params.a, params.b)
}