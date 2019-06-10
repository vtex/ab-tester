import { LoggerClient as Logger } from '../../clients/logger'
import { DefaultEvaluationResponse } from '../../utils/evaluation-response'
import { TestWorkspaces } from '../testWorkspaces'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
  const { vtex: { account }, resources: { router, vbase } } = ctx

  try {
    if (await router.getWorkspaces(account) === null) {
      ctx.status = 400
      throw new Error('Test not initialized')
    }
    const data = await vbase.get(bucket, fileName)
    if (!data) {
      return [DefaultEvaluationResponse('Test not initialized', 'none', 'none')]
    }
    let beginning = data.dateOfBeginning
    let probability = data.probability
    if (beginning === undefined) {
      beginning = new Date()
      probability = 0.999
    }

    return await TestWorkspaces(account, beginning, probability, ctx) || []
  } catch (err) {
    const logger = new Logger(ctx.vtex, {})
    logger.sendLog(err, { status: ctx.status, message: err.message })
    throw new Error(err)
  }
}