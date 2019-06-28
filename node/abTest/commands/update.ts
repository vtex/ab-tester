import { LoggerClient as Logger } from '../../clients/logger'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { MinutesSinceQuery } from '../../utils/hoursSince'
import { UpdateParameters } from '../updateParameters'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function UpdateStatusOnEvent(ctx: EventsContext): Promise<void> {
  const { account, resources: { router, storedash, vbase } } = ctx
  try {
    const workspacesMetadata = await router.getWorkspaces(account)
    const testingWorkspaces = new TestingWorkspaces(workspacesMetadata)
    if (testingWorkspaces.Length() > 0) {
      const data = await vbase.get(bucket, fileName)
      let beginning = data.dateOfBeginning
      if (beginning === undefined) {
        beginning = new Date()
      }

      const beginningString = MinutesSinceQuery(beginning)
      const workspacesData = await storedash.getWorkspacesData(beginningString)
      await UpdateParameters(account, beginningString, workspacesData, testingWorkspaces, workspacesMetadata.Id, router, storedash)
    }
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: err.status, message: err.message })
    throw new Error(err)
  }
}