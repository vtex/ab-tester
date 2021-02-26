import { UpdateParameters } from '../updateParameters'

export async function UpdateStatusOnEvent(ctx: Context): Promise<void> {
  const { vtex: { account, logger }, clients: { abTestRouter, storedash, storage } } = ctx
  try {
    const testingWorkspaces = await abTestRouter.getWorkspaces(account)
    if (testingWorkspaces.Length() > 0) {
      const testData = await storage.getTestData(ctx)
      let beginning = testData.dateOfBeginning
      let hours = testData.initialStageTime
      let proportion = testData.initialProportion
      if (!(beginning && hours && proportion)) {
        beginning = new Date().toISOString().substr(0, 16)
        hours = 0
        proportion = 100
      }
      const testType = testData.testType
      const workspacesData: WorkspaceData[] = (testType === 'revenue') ? await GetGranularData(ctx) : await storedash.getWorkspacesData(beginning)
      await UpdateParameters(ctx, beginning, hours, proportion, workspacesData, testingWorkspaces, testingWorkspaces.Id() || 'noId', testType)
    }
  } catch (err) {
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
