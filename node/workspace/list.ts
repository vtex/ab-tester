import { IOContext } from '@vtex/api'
import { MinimumABTestParameter } from '../utils/workspace'
import { ABWorkspaces } from './workspaces'

async function ListWorkspaces(account: string, ctx: IOContext): Promise<ABWorkspaceMetadata[]> {
    const masterWorkspace = await new ABWorkspaces(ctx)
    return await masterWorkspace.list(account)
}

export async function TestingWorkspaces(account: string, ctx: IOContext): Promise<string[]> {
    const workspaces = await ListWorkspaces(account, ctx)
    const testingWorkspaces: string[] = []
    for (const workspace of workspaces) {
        if (MinimumABTestParameter(workspace) >= 1) {
            testingWorkspaces.push(workspace.name)
        }
    }
    return testingWorkspaces
}