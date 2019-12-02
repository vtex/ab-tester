import { TSMap } from 'typescript-map'
import TestingParameters from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestWorkspaces } from '../testWorkspaces'

export async function FinishAbTestForWorkspace(ctx: Context): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, logger, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  try {
    const workspaceMetadata = await abTestRouter.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
    testingWorkspaces.Remove(workspaceName)
    if (testingWorkspaces.Length() <= 1) {
      await abTestRouter.deleteParameters(account)
      await abTestRouter.deleteWorkspaces(account)
      const data = await storage.get(ctx.vtex)
      const beginning = data && data.dateOfBeginning
        ? data.dateOfBeginning
        : new Date().toISOString().substr(0, 16)
      await storage.finishABtest(ctx.vtex, (await TestWorkspaces(account, beginning, workspaceMetadata, ctx)))
      logger.info({message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
      return
    }

    const testingParameters = new TestingParameters(workspaceMetadata.workspaces)
    testingParameters.Remove(workspaceName)
    await abTestRouter.setWorkspaces(account, {
      id: workspaceMetadata.id,
      workspaces: testingWorkspaces.ToArray(),
    })
    const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
    await abTestRouter.setParameters(account, {
      Id: workspaceMetadata.id,
      parameterPerWorkspace: tsmap,
    })
    logger.info({message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }
}