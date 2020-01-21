import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../../typings/testingParameters'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { firstOrDefault } from '../../utils/firstOrDefault'
import { TestWorkspaces } from '../testWorkspaces'

export async function FinishAbTestForWorkspace(ctx: Context): Promise<void> {
  const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
  const workspaceName = firstOrDefault(finishingWorkspace)
  let workspaceMetadata: ABTestWorkspacesMetadata
  try {
    workspaceMetadata = await abTestRouter.getWorkspaces(account)
  } catch (err) {
    if (err.status === 404) {
      err.message = 'Test not found'
    }
    ctx.vtex.logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }

  const testingWorkspaces = new TestingWorkspaces(workspaceMetadata)
  testingWorkspaces.Remove(workspaceName)
  if (testingWorkspaces.Length() <= 1) {
    try {
      await abTestRouter.deleteParameters(account).catch(logErrorTest(ctx))
      await abTestRouter.deleteWorkspaces(account).catch(logErrorTest(ctx))

      const testData = await storage.getTestData(ctx).catch(logErrorTest(ctx))
      const beginning = testData && testData.dateOfBeginning
        ? testData.dateOfBeginning
        : new Date().toISOString().substr(0, 16)

      const results = await TestWorkspaces(account, beginning, workspaceMetadata, ctx).catch(logErrorTest(ctx))

        await storage.finishABtest(ctx, results).catch(logErrorTest(ctx))
        ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
        return
    } catch (err) {
      if (err.status === 404) {
        err.message = 'Workspace not found'
      }
      ctx.vtex.logger.error({ status: ctx.status, message: err.message })
      throw new Error(err)
    }
  }

  try {
      const testType = (await storage.getTestData(ctx)).testType
      const testingParameters = createTestingParameters(testType, workspaceMetadata.workspaces)
      testingParameters.Remove(workspaceName)
      await abTestRouter.setWorkspaces(account, {
        id: workspaceMetadata.id,
        workspaces: testingWorkspaces.ToArray(),
      }).catch(logErrorTest(ctx))
      const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
      await abTestRouter.setParameters(account, {
        Id: workspaceMetadata.id,
        parameterPerWorkspace: tsmap,
      }).catch(logErrorTest(ctx))
      ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
    } catch (err) {
      if (err.status === 404) {
        err.message = 'Workspace not found'
      }
      ctx.vtex.logger.error({ status: ctx.status, message: err.message })
      throw new Error(err)
    }
  }

  const logErrorTest = (ctx: Context) => (err: any) => {
    if (err.status === 404) {
      err.message = 'Test not found'
    }
    ctx.vtex.logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }