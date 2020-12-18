import { GetGranularData } from '../data/cachedData'
import { UpdateProportions } from '../updateProportions'

export async function UpdateStatusOnEvent(ctx: Context): Promise<void> {
  const { vtex: { account, logger }, clients: { abTestRouter, storedash, storage } } = ctx
  try {
    const testingWorkspaces = await abTestRouter.getWorkspaces(account)
    if (testingWorkspaces.Length() > 0) {
      const testData = await storage.getTestData(ctx)
      let beginning = testData.dateOfBeginning
      let hours = testData.initialStageTime
      let initialMasterProportion = testData.initialProportion
      if (!(beginning && initialMasterProportion && hours !== undefined)) {
        beginning = new Date().toISOString().substr(0, 16)
        hours = 0
        initialMasterProportion = 5000
      }
      const testType = testData.testType
      const testApproach = testData.testApproach
      const workspacesData: WorkspaceData[] = (testApproach === 'frequentist' && testType === 'revenue') ? await GetGranularData(ctx) : await storedash.getWorkspacesData(beginning)
      await UpdateProportions(ctx, beginning, hours, initialMasterProportion, workspacesData, testingWorkspaces, testingWorkspaces.Id(), testType, testApproach)
    }
  } catch (err) {
    err.message = 'Error on test update: ' + err.message
    logger.error({ status: err.status, message: err.message })
    throw err
  }
}