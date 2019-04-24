import { LoggerClient as Logger } from '../../clients/logger'
import { HoursSince } from '../../utils/hoursSince'
import { TestingWorkspaces } from '../../workspace/list'
import { UpdateWorkspacesData } from '../../workspace/modify'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function UpdateStatusOnEvent(ctx: EventsContext): Promise<void> {
  const { account, resources: { vbase } } = ctx

  try {
    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    if (testingWorkspaces.length > 0) {
      const data = await vbase.get(bucket, fileName)
      let beginning = data.dateOfBeginning
      if (beginning === undefined) {
        beginning = new Date()
      }

      const beginningQuery = HoursSince(beginning)
      await UpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx)
    }
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: err.status, message: err.message })
    throw new Error(err)
  }
}