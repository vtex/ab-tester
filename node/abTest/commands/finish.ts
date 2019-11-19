import { TSMap } from 'typescript-map'
import { TestWorkspaces } from '../testWorkspaces'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'

export async function FinishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, resources: { logger, router, vbase } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    const workspaceMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
    testingWorkspaces.Remove(workspaceName)
    if (testingWorkspaces.Length() <= 1) {
      await router.deleteParameters(account)
      await router.deleteWorkspaces(account)
      const data = await vbase.get(ctx.vtex)
      const beginning = data && data.dateOfBeginning
        ? data.dateOfBeginning
        : new Date().toISOString().substr(0, 16)
      await vbase.finishABtest(ctx.vtex, (await TestWorkspaces(account, beginning, workspaceMetadata, ctx)))
      logger.info(`A/B Test finished in ${account} for workspace ${workspaceName}`, { account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
      return
    }

    const testingParameters = new TestingParameters(workspaceMetadata.workspaces)
    testingParameters.Remove(workspaceName)
    await router.setWorkspaces(account, {
      id: workspaceMetadata.id,
      workspaces: testingWorkspaces.ToArray(),
    })
    const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
    await router.setParameters(account, {
      Id: workspaceMetadata.id,
      parameterPerWorkspace: tsmap,
    })
    logger.info(`A/B Test finished in ${account} for workspace ${workspaceName}`, { account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }
}