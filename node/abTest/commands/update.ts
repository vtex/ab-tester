import TestingWorkspaces from '../../typings/testingWorkspace'
import { MinutesSinceQuery } from '../../utils/hoursSince'
import { UpdateParameters } from '../updateParameters'

export async function UpdateStatusOnEvent(ctx: EventsContext): Promise<void> {
  const { account, resources: { logger, router, storedash, vbase } } = ctx
  try {
    const workspacesMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    if (testingWorkspaces.Length() > 0) {
      const data = await vbase.get(ctx)
      let beginning = data.dateOfBeginning
      if (beginning === undefined) {
        beginning = new Date().toISOString().substr(0, 16)
      }

      const beginningString = MinutesSinceQuery(beginning)
      const workspacesData = await storedash.getWorkspacesData(beginningString)
      await UpdateParameters(account, beginningString, workspacesData, testingWorkspaces, workspacesMetadata.id || 'noId', router, storedash)
    }
  } catch (err) {
    logger.error({ status: err.status, message: err.message })
    throw new Error(err)
  }
}