import { MinimumABTestParameter } from '../utils/minimum-parameters'
import { ABWorkspaces } from './workspaces'

export async function ListWorkspaces(account: string, ctx: ColossusContext): Promise<ABWorkspaceMetadata[]> {
    const masterContext = ctx.vtex
    masterContext.workspace = 'master'
    const masterWorkspace = await new ABWorkspaces(masterContext)
    return await masterWorkspace.list(account)
}

export async function TestingWorkspaces(account: string, ctx: ColossusContext): Promise<string[]> {
    const workspaces = await ListWorkspaces(account, ctx)
    const testingWorkspaces: string[] = []
    for (const workspace of workspaces) {
        if (MinimumABTestParameter(workspace) >= 1) {
            testingWorkspaces.push(workspace.name)
        }
    }
    return testingWorkspaces
}