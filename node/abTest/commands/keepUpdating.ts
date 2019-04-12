import { LoggerClient as Logger } from '../../clients/logger'
import { HoursSince } from '../../utils/hoursSince'
import { TestingWorkspaces } from '../../workspace/list'
import { GetAndUpdateWorkspacesData } from '../../workspace/modify'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'
const SECONDS_TO_MILISECONDS = 1000
const MINUTES_TO_MILISECONDS = 60 * 1000

async function SendEventForUpdate(ctx: ColossusContext): Promise<void> {
  const { resources: { events } } = ctx

  try {
    events.sendEvent('', 'keep_updating')
  } catch (err) {
    const logger = new Logger(ctx.vtex, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}

export async function UpdateStatusOnEvent(ctx: EventsContext): Promise<void> {
  const { account, resources: { events, vbase } } = ctx

  try {
    const data = await vbase.get(bucket, fileName)
    let beginning = data.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date()
    }

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const beginningQuery = HoursSince(beginning)
    await delay(10 * MINUTES_TO_MILISECONDS)
    await GetAndUpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx)
    console.log(ctx.workspace)
    events.sendEvent('', 'keep')
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: err.status, message: err.message })
    throw new Error(err)
  }
}

export const keep = async (ctx: ColossusContext) => {
  await delay(5 * SECONDS_TO_MILISECONDS)
  await SendEventForUpdate(ctx)
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getWithRetriesHelper(retries: number, ctx: EventsContext) {
  let error = null
  while (retries--) {
      try {
          return await UpdateStatusOnEvent(ctx)
      } catch (err) {
          err.response ?
              console.error(`Error ${err.response.status} on keeping A/B Test updated, ${retries} retries left`) :
              console.error(`Error on keeping A/B Test updated, ${retries} retries left`)
          error = err
      }
  }
  throw error
}