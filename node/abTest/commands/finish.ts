import { LoggerClient as Logger } from '../../clients/logger'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestingWorkspaces } from '../../workspace/list'
import { FinishABTestParams } from '../../workspace/modify'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    await FinishABTestParams(account, workspaceName, ctx.vtex)
    const testingWorkspaces = await TestingWorkspaces(account, ctx.vtex)
    if (testingWorkspaces.length <= 1) {
      await FinishABTestParams(account, 'master', ctx.vtex)
    }
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    const logger = new Logger(ctx.vtex, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}