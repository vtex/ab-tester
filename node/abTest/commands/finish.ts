import { NotFoundError } from '@vtex/api'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { InitializeParameters, InitializeWorkspaces } from '../initialize-Router'
import { CheckFinishingWorkspace as CheckWorkspace } from '../../utils/Request/Checks'
import { EndTestForWorkspace, EndTest } from '../endTest'

export async function FinishAbTest(ctx: Context): Promise<void> {
  const { vtex: { account }, clients: {abTestRouter } } = ctx
  try {
    const testingWorkspaces = await abTestRouter.getWorkspaces(account)

    if (testingWorkspaces.Length() === 0) {
      ctx.status = 404
      throw new NotFoundError(`Test not initialized for this account`)
    }
    await EndTest(testingWorkspaces, ctx)
  } catch (err) {
    err.message = 'Error finishing A/B test: ' + err.message
    throw err
  }
}

export async function FinishAbTestForWorkspace(ctx: Context): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx

  try {
    const currentWorkspaces = await abTestRouter.getWorkspaces(account)

    if (currentWorkspaces.Length() === 0) {
      ctx.response.status = 404
      throw new NotFoundError(`Test not initialized for this account`)
    }
    const workspaceName = firstOrDefault(finishingWorkspace)
    CheckWorkspace(workspaceName, currentWorkspaces)

    if (IsLastTestingWorkspace(currentWorkspaces)) {
      await EndTestForWorkspace(currentWorkspaces, ctx)
    } 
    else {
      currentWorkspaces.Remove(workspaceName)
      const testingWorkspaces = new TestingWorkspaces({id: '', workspaces: currentWorkspaces.ToArray()})

      const testData = await storage.getTestData(ctx)
      const [ testType, proportion, initialTime ] = [ testData.testType, testData.initialProportion, testData.initialStageTime ]
      
      await InitializeWorkspaces(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray())
      await InitializeParameters(ctx, testingWorkspaces.Id(), testingWorkspaces.ToArray(), proportion, testType)
      await storage.initializeABtest(initialTime, proportion, testType, ctx)

      ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
    }

  } catch (err) {
    err.message = 'Error finishing A/B test: ' + err.message
    throw err
  }
}

const IsLastTestingWorkspace = (testingWorkspaces: TestingWorkspaces): boolean => {
  return (testingWorkspaces.Length() <= 2)
}