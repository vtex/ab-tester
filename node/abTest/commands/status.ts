import { TestWorkspaces } from '../testWorkspaces'

export async function ABTestStatus(ctx: Context): Promise<TestResult[]> {
  const { vtex: { account }, clients: { abTestRouter, logger, storage } } = ctx
  try {
    const workspaces = await abTestRouter.getWorkspaces(account)
    if (workspaces === null) {
      ctx.response.status = 200
      return []
    }

    const testData = await storage.getTestData(ctx)
    let beginning = testData.dateOfBeginning
    if (beginning === undefined) {
      beginning = new Date().toISOString().substr(0, 16)
    }

    logger.info({message: `A/B Test Status to user in ${account}`, account: `${account}`, method: 'TestStatus' })
    return await TestWorkspaces(account, beginning, workspaces, ctx) || []
  } catch (err) {
    logger.error({ status: ctx.status, message: err.message })
    throw err
  }
}