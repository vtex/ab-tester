import { NotFoundError } from '@vtex/api'
import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import EndTest from '../endTest'

export async function FinishAbTestForWorkspace(ctx: Context): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)

  if (workspaceName === 'master') {
    throw new Error(`Bad workspace name: the master workspace cannot be removed from the test`)
  }
  try {

    const testingWorkspaces = await abTestRouter.getWorkspaces(account)

    if (!(testingWorkspaces.Includes(workspaceName))) {
      throw new Error(`Bad workspace name: make sure to select one of the workspaces under test`)
    }

    if (testingWorkspaces.Length() === 0) {
      ctx.response.status = 404
      throw new NotFoundError(`Test not initialized for this account`)
    }

    if (IsLastTestingWorkspace(testingWorkspaces)) {
      await EndTest(testingWorkspaces, ctx)
    } 
    else {
      const testType = (await storage.getTestData(ctx)).testType
      testingWorkspaces.Remove(workspaceName)
      const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())
      await abTestRouter.setWorkspaces(account, {
        id: testingWorkspaces.Id(),
        workspaces: testingWorkspaces.ToArray(),
      })
      const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
      await abTestRouter.setParameters(account, {
        Id: testingWorkspaces.Id(),
        parameterPerWorkspace: tsmap,
      })
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
