import TestingWorkspaces from '../../typings/testingWorkspace'
import { UpdateParameters } from '../updateParameters'
import { TestType } from '../../clients/vbase';

export async function UpdateStatusOnEvent(ctx: Context): Promise<void> {
  const { vtex: { account }, clients: { abTestRouter, logger, storedash, storage } } = ctx
  try {
    const workspacesMetadata = await abTestRouter.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    if (testingWorkspaces.Length() > 0) {
      const testData = await storage.getTestData(ctx)
      let beginning = testData.dateOfBeginning
      let hours = testData.initialStageTime
      let proportion = testData.initialProportion
      if (!(beginning && hours && proportion)) {
        beginning = new Date().toISOString().substr(0, 16)
        hours = 0
        proportion = 100
      }
      const testType = (await storage.getTestData(ctx)).testType
      const workspacesData: WorkspaceData[] = (testType === TestType.revenue) ? await storedash.getWorkspacesGranularData(beginning) : await storedash.getWorkspacesData(beginning)
      await UpdateParameters(ctx, beginning, hours, proportion, workspacesData, testingWorkspaces, workspacesMetadata.id || 'noId', testType)
    }
  } catch (err) {
    logger.error({ status: err.status, message: err.message })
    throw new Error(err)
  }
}