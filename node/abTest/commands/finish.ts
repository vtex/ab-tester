import { NotFoundError } from '@vtex/api'
import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import EndTest from '../endTest'

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

  if (IsLastTestingWorkspace(testingWorkspaces)) {
    return await EndTest(testingWorkspaces, ctx).catch(logErrorTest(ctx))
  }

  try {
    const testType = (await storage.getTestData(ctx)).testType
    testingWorkspaces.Remove(workspaceName)
    const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())
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

const IsLastTestingWorkspace = (testingWorkspaces: TestingWorkspaces): boolean => {
  return (testingWorkspaces.Length() <= 2)
}