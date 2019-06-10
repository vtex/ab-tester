import { LoggerClient as Logger } from '../../clients/logger'
import TestingWorkspaces from '../../typings/testingWorkspace'
import { MinutesSinceQuery } from '../../utils/hoursSince'
import { UpdateWorkspacesData } from '../../workspace/modify'
import { UpdateParameters } from '../updateParameters'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function UpdateStatusOnEvent(ctx: EventsContext): Promise<void> {
  const { account, resources: { router, storedash, vbase } } = ctx
  try {
    const testingWorkspaces = new TestingWorkspaces(await router.getWorkspaces(account))
    if (testingWorkspaces.Length() > 0) {
      const data = await vbase.get(bucket, fileName)
      let beginning = data.dateOfBeginning
      if (beginning === undefined) {
        beginning = new Date()
      }

      const beginningString = MinutesSinceQuery(beginning)
      const workspacesData = await storedash.getWorkspacesData(beginningString)
      await UpdateParameters(account, beginningString, workspacesData, testingWorkspaces, router, storedash)
      await UpdateWorkspacesData(account, beginningString, testingWorkspaces.WorkspacesNames(), ctx, router, storedash)
    }
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: err.status, message: err.message })
    throw new Error(err)
  }
}