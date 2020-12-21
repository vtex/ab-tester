import { calculateVariance, aggregatedVariance } from '../../utils/mathTools/variance'

export async function GetGranularData(ctx: Context): Promise<WorkspaceData[]> {
    const storage = ctx.clients.storage
    const cachedData = await storage.getWorkspaceDataCache(ctx)

    UpdateCache(ctx, cachedData)

    return cachedData.ordersValue
}

async function UpdateCache(ctx: Context, cachedData: WorkspaceDataCache) {
    const { clients: { storedash, storage } } = ctx

    const { data: newData, updateTime: lastUpdate } = await storedash.getWorkspacesGranularData(cachedData.lastUpdate)

    for (const cachedWorkspaceData of cachedData.ordersValue) {
        for (const newWorkspaceData of newData) {
            if (cachedWorkspaceData.Workspace === newWorkspaceData.Workspace) {
                updateData(cachedWorkspaceData, newWorkspaceData)
            }
        }
    }

    cachedData.lastUpdate = lastUpdate
    storage.updateWorkspaceDataCache(cachedData, ctx)
}

function updateData(currentData: WorkspaceData, newData: WorkspaceData): void {
    currentData.Sessions += newData.Sessions
    currentData.OrderSessions += newData.OrderSessions
    currentData.NoOrderSessions += newData.NoOrderSessions
    currentData.OrdersValue += newData.OrdersValue
    currentData.Conversion = currentData.Sessions > 0 ? currentData.OrdersValue / currentData.Sessions : 0
    currentData.OrdersValueVariance = updateVariance(currentData, newData.OrdersValueHistory, newData.NoOrderSessions)
}

function updateVariance(currentData: WorkspaceData, newValues: number[], newZeroValues: number): number {
    if (currentData.Sessions === 0) return calculateVariance(newValues, newZeroValues)

    const currentVariance = currentData.OrdersValueVariance
    const currentMean = currentData.OrdersValue / currentData.Sessions
    const currentN = currentData.Sessions

    return aggregatedVariance(currentVariance, currentMean, currentN, newValues, newZeroValues)
}