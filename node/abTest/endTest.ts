import TestingWorkspaces from '../typings/testingWorkspace'
import { TestWorkspaces } from './testWorkspaces'
import { firstOrDefault } from '../utils/firstOrDefault'

export const EndTestForWorkspace = async (testingWorkspaces: TestingWorkspaces, ctx: Context) => {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)

  await abTestRouter.deleteParameters(account)
  await abTestRouter.deleteWorkspaces(account)

  const testData = await storage.getTestData(ctx)
  const beginning = testData && testData.dateOfBeginning
    ? testData.dateOfBeginning
    : new Date().toISOString().substr(0, 16)

  const testType = testData.testType
  const results = await TestWorkspaces(account, beginning, testingWorkspaces, testType, ctx)

  await storage.finishABtest(ctx, results)
  ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
}