import { NotFoundError } from '@vtex/api'
import { TestWorkspaces } from '../testWorkspaces'

export async function ABTestStatus(ctx: Context): Promise<TestResult> {
  const { vtex: { account, logger }, clients: { abTestRouter, storage } } = ctx
  try {
    const testingWorkspaces = await abTestRouter.getWorkspaces(account)
    if (testingWorkspaces.Length() === 0) {
      ctx.response.status = 404
      throw new NotFoundError(`Test not initialized for this account`)
    }

    const testData = await storage.getTestData(ctx)
    const testType = testData.testType
    const testApproach = testData.testApproach
    let beginning = testData.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date().toISOString().substr(0, 16)
    }

    logger.info({message: `A/B Test Status to user in ${account}`, account: `${account}`, method: 'TestStatus' })
    return await TestWorkspaces(ctx, account, beginning, testingWorkspaces, testType, testApproach) || []
  } catch (err) {
    err.message = 'Error calculating A/B test status: ' + err.message
    throw err
  }
}