import TestingWorkspaces from '../../typings/testingWorkspace'
import { MinutesSinceQuery } from '../../utils/hoursSince'
import { UpdateParameters } from '../updateParameters'

export async function UpdateStatusOnEvent(ctx: Context): Promise<void> {
  const { vtex: { account }, clients: { abTestRouter, logger, storedash, storage } } = ctx
  try {
    const workspacesMetadata = await abTestRouter.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    if (testingWorkspaces.Length() > 0) {
      const data = await storage.get(ctx.vtex)
      let beginning = data.dateOfBeginning
      let hours = data.initialStageTime
      let proportion = data.initialProportion
      if (!(beginning && hours && proportion)) {
        beginning = new Date().toISOString().substr(0, 16)
        hours = 0
        proportion = 100
      }

      const beginningString = MinutesSinceQuery(beginning)
      const workspacesData = await storedash.getWorkspacesData(beginningString)
      await UpdateParameters(ctx, beginningString, hours, proportion, workspacesData, testingWorkspaces, workspacesMetadata.id || 'noId')
    }
  } catch (err) {
    logger.error({ status: err.status, message: err.message })
    throw new Error(err)
  }
}