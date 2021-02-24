import { NotFoundError } from '@vtex/api'
import { TestWorkspaces } from '../testWorkspaces'

export async function ABTestStatus(ctx: Context): Promise<TestResult[]> {
  const { vtex: { account, logger }, clients: { abTestRouter, storage } } = ctx
  try {
    const testingWorkspaces = await abTestRouter.getWorkspaces(account)
    if (testingWorkspaces.Length() === 0) {
      ctx.response.status = 404
      throw new NotFoundError(`Test not initialized for this account`)
    }

    const testData = await storage.getTestData(ctx)
    let beginning = testData.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date().toISOString().substr(0, 16)
    }

    logger.info({message: `A/B Test Status to user in ${account}`, account: `${account}`, method: 'TestStatus' })
    return await TestWorkspaces(account, beginning, testingWorkspaces, ctx) || []
  } catch (err) {
    logger.error({ status: ctx.status, message: err.message })
    throw err
  }
}