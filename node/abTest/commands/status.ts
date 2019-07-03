import { DefaultEvaluationResponse } from '../../utils/evaluation-response'
import { TestWorkspaces } from '../testWorkspaces'

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
  const { vtex: { account }, resources: { logger, router, vbase } } = ctx
  try {
    if (await router.getWorkspaces(account) === null) {
      ctx.status = 400
      throw new Error('Test not initialized')
    }
    const data = await vbase.get(ctx.vtex)
    if (!data) {
      return [DefaultEvaluationResponse('Test not initialized', 'none', 'none')]
    }
    let beginning = data.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date().toISOString().substr(0, 16)
    }
    logger.info(`A/B Test Status to user in ${account}`, { account: `${account}`, method: 'TestStatus' })
    return await TestWorkspaces(account, beginning, ctx) || []
  } catch (err) {
    logger.error({ status: ctx.status, message: err.message })
    throw new Error(err)
  }
}