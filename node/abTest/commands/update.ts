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
        initialMasterProportion = 10000
      }
      const testType = testData.testType
      const testApproach = testData.testApproach
      const workspacesData: WorkspaceData[] = (testApproach === 'frequentist' && testType === 'revenue') ? await GetGranularData(ctx) : await storedash.getWorkspacesData(beginning)
      await UpdateProportions(ctx, beginning, hours, initialMasterProportion, workspacesData, testingWorkspaces, testingWorkspaces.Id() || 'noId', testType, testApproach)
    }
  } catch (err) {
    err.message = 'Error on test update: ' + err.message
    logger.error({ status: err.status, message: err.message })
    throw err
  }
}

async function GetGranularData(ctx: Context): Promise<WorkspaceData[]> {
  const { clients: { storedash, storage } } = ctx

  const cachedData = await storage.getWorkspaceDataCache(ctx)
  const { data: newData, updateTime: lastUpdate } = await storedash.getWorkspacesGranularData(cachedData.lastUpdate)

  for (const cachedWorkspaceData of cachedData.ordersValue) {
    let notFound = true
    for (const newWorkspaceData of newData) {
      if (cachedWorkspaceData.Workspace === newWorkspaceData.Workspace) {
        notFound = false
        newWorkspaceData.OrdersValueHistory = cachedWorkspaceData.OrdersValueHistory.concat(newWorkspaceData.OrdersValueHistory)
      }
    }
    if (notFound) {
      newData.push(cachedWorkspaceData)
    }
  }

  cachedData.lastUpdate = lastUpdate
  cachedData.ordersValue = newData
  storage.updateWorkspaceDataCache(cachedData, ctx)

  return newData
}
