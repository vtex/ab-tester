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
    if (testingWorkspaces === ['master']) {
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

export async function getWithRetriesHelper(retries: number, ctx: ColossusContext) {
  let error = null
  while (retries--) {
    try {
      return await FinishAbTestForWorkspace(ctx)
    } catch (err) {
      err.response ?
        console.error(`Error ${err.response.status} on finishing A/B Test, ${retries} retries left`) :
        console.error(`Error on finishing A/B Test, ${retries} retries left`)
      error = err
    }
  }
  throw error
}