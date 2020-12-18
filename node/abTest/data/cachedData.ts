export async function GetGranularData(ctx: Context): Promise<WorkspaceData[]> {
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
  