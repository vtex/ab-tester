import { LoggerClient as Logger } from '../../clients/logger'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { FinishABTestParams } from '../../workspace/modify'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, resources: { router, vbase } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    await FinishABTestParams(account, workspaceName, ctx.vtex)
    const workspaceMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
    testingWorkspaces.Remove(workspaceName)
    if (testingWorkspaces.Length() <= 1) {
      await router.deleteParameters(account)
      await router.deleteWorkspaces(account)
      await FinishABTestParams(account, 'master', ctx.vtex)
      await vbase.finishABtest()
      return
    }

    const testingParameters = new TestingParameters(testingWorkspaces.ToArray())
    await router.setWorkspaces(account, {
      Id: workspaceMetadata.Id,
      workspaces: testingWorkspaces.ToArray(),
    })
    await router.setParameters(account, testingParameters.ToArray())
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    const logger = new Logger(ctx.vtex, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}