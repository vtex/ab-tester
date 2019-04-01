import { TestingWorkspaces } from '../../workspace/list'
import { FinishABTestParams } from '../../workspace/modify'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { LoggerClient as Logger } from '../../clients/logger'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { finishingWorkspace } } } } = ctx
    const workspaceName = firstOrDefault(finishingWorkspace)
    try {
        await FinishABTestParams(account, workspaceName, ctx)
        var testingWorkspaces = await TestingWorkspaces(account, ctx)
        if (testingWorkspaces == ['master']) {
            await FinishABTestParams(account, 'master', ctx)
        }
    } catch (err) {
        if (err.status == 404) {
            err.message = 'Workspace not found'
        }
        const logger = new Logger(ctx, {})
        logger.sendLog(err, { status: ctx.status, message: err.message })
        throw new Error(err)
    }
}