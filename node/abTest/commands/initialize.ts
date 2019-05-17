import { LoggerClient as Logger } from '../../clients/logger'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestingWorkspaces } from '../../workspace/list'
import { InitializeABTestParams } from '../../workspace/modify'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { probability, initializingWorkspace } } }, resources: { vbase } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
        if (!testingWorkspaces.includes('master')) {
            await InitializeABTestParams(account, 'master', ctx.vtex)
        }
        await InitializeABTestParams(account, workspaceName, ctx.vtex)
        await vbase.initializeABtest(1 - Number(probability))
    } catch (err) {
        if (err.status === 404) {
            err.message = 'Workspace not found'
        }
        const logger = new Logger(ctx.vtex, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}