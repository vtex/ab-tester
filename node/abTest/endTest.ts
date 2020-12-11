import TestingWorkspaces from '../typings/testingWorkspace'
import { TestWorkspaces } from './testWorkspaces'
import { firstOrDefault } from '../utils/firstOrDefault'

export const EndTestForWorkspace = async (testingWorkspaces: TestingWorkspaces, ctx: Context) => {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)

  await abTestRouter.deleteProportions(account)
  await abTestRouter.deleteWorkspaces(account)

  const testData = await storage.getTestData(ctx)
  const beginning = testData && testData.dateOfBeginning
    ? testData.dateOfBeginning
    : new Date().toISOString().substr(0, 16)

  const testType = testData.testType
  const testApproach = testData.testApproach
  const results = await TestWorkspaces(ctx, account, beginning, testingWorkspaces, testType, testApproach)

  await storage.finishABtest(ctx, results, beginning)
  ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
}

export const EndTest = async (testingWorkspaces: TestingWorkspaces, ctx: Context) => {
  const { vtex: { account }, clients: { abTestRouter, storage } } = ctx

  await abTestRouter.deleteProportions(account)
  await abTestRouter.deleteWorkspaces(account)

  const testData = await storage.getTestData(ctx)
  const beginning = testData && testData.dateOfBeginning
    ? testData.dateOfBeginning
    : new Date().toISOString().substr(0, 16)

  const testType = testData.testType
  const testApproach = testData.testApproach
  const results = await TestWorkspaces(ctx, account, beginning, testingWorkspaces, testType, testApproach)

  await storage.finishABtest(ctx, results, beginning)

  ctx.vtex.logger.info({ message: `A/B Test finished in account ${account}`, account: `${account}`, method: 'TestFinished' })
}