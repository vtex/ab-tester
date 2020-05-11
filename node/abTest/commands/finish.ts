import { NotFoundError } from '@vtex/api'
import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestWorkspaces } from '../testWorkspaces'

export async function FinishAbTestForWorkspace(ctx: Context): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  let testingWorkspaces: TestingWorkspaces
  try {
    testingWorkspaces = await abTestRouter.getWorkspaces(account)
  } catch (err) {
    err.message = 'Error getting test metadata from router API'
    ctx.vtex.logger.error({ status: ctx.status, message: err.message })
    throw err
  }
  if (testingWorkspaces.Length() === 0) {
    ctx.response.status = 404
    throw new NotFoundError(`Test not initialized for this account`)
  }

  testingWorkspaces.Remove(workspaceName)
  if (testingWorkspaces.Length() <= 1) {
    try {
      await abTestRouter.deleteParameters(account).catch(logErrorTest(ctx))
      await abTestRouter.deleteWorkspaces(account).catch(logErrorTest(ctx))

      const testData = await storage.getTestData(ctx).catch(logErrorTest(ctx))
      const beginning = testData && testData.dateOfBeginning
        ? testData.dateOfBeginning
        : new Date().toISOString().substr(0, 16)

      const results = await TestWorkspaces(account, beginning, testingWorkspaces, ctx).catch(logErrorTest(ctx))

      await storage.finishABtest(ctx, results).catch(logErrorTest(ctx))
      ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
      return
    } catch (err) {
      if (err.status === 404) {
        err.message = 'Workspace not found'
      }
      ctx.vtex.logger.error({ status: ctx.status, message: err.message })
      throw err
    }
  }

  try {
    const testType = (await storage.getTestData(ctx)).testType
    const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())
    testingParameters.Remove(workspaceName)
    await abTestRouter.setWorkspaces(account, {
      id: testingWorkspaces.Id(),
      workspaces: testingWorkspaces.ToArray(),
    }).catch(logErrorTest(ctx))
    const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
    await abTestRouter.setParameters(account, {
      Id: testingWorkspaces.Id(),
      parameterPerWorkspace: tsmap,
    }).catch(logErrorTest(ctx))
    ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Workspace not found'
    }
    ctx.vtex.logger.error({ status: ctx.status, message: err.message })
    throw err
  }
}

const logErrorTest = (ctx: Context) => (err: any) => {
  if (err.status === 404) {
    err.message = 'Test not found'
  }
  ctx.vtex.logger.error({ status: ctx.status, message: err.message })
  throw err
}