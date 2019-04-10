import { HttpClient, InstanceOptions } from '@vtex/api'
import { LoggerClient as Logger } from '../../clients/logger'
import { HoursSince } from '../../utils/hoursSince'
import { TestingWorkspaces } from '../../workspace/list'
import { GetAndUpdateWorkspacesData } from '../../workspace/modify'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'
const SECONDS_TO_MILISECONDS = 1000

export async function UpdateStatus(ctx: ColossusContext): Promise<void> {
  const { vtex: { account }, resources: { vbase } } = ctx

  try {
    const data = await vbase.get(bucket, fileName)
    let beginning = data.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date()
    }

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    const beginningQuery = HoursSince(beginning)
    await GetAndUpdateWorkspacesData(account, beginningQuery, testingWorkspaces, ctx)
  } catch (err) {
    const logger = new Logger(ctx, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}

export const keep = async (ctx: ColossusContext) => {
  const route = new Routes(ctx, {})
  await UpdateStatus(ctx)
  await delay(3 * SECONDS_TO_MILISECONDS)
  await route.getUserRoutes()
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class Routes {
  private http: HttpClient

  constructor(ctx: ColossusContext, opts: InstanceOptions) {
    this.http = HttpClient.forWorkspace('ab-tester', ctx.vtex, opts)
  }

  public getUserRoutes = (): Promise<void> => {
    return this.http.get<void>(`/_v/private/abtesting/keep?__v=${process.env.VTEX_APP_VERSION}`)
  }
}