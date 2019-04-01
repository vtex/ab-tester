import { TestingWorkspaces } from '../../workspace/list'
import { InitializeABTestParams } from '../../workspace/modify'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { initializeABtest } from '../saveBeginning'
import { LoggerClient as Logger } from '../../clients/logger'

export async function InitializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { probability, initializingWorkspace } } } } = ctx
    const workspaceName = firstOrDefault(initializingWorkspace)
    try {
        var testingWorkspaces = await TestingWorkspaces(account, ctx)
        if (!testingWorkspaces.includes('master')) {
            await InitializeABTestParams(account, 'master', ctx)
        }
        await InitializeABTestParams(account, workspaceName, ctx)
        await initializeABtest(Number(probability), ctx)
    } catch (err) {
        if (err.status == 404) {
            err.message = 'Workspace not found'
        }
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}